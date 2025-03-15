/*
Author: Thanos Moschou
Description: A simple crowdfunding dapp.
*/

import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import crowdfunding from './crowdfunding';

class App extends Component {
  state = {
    currentAddress: '',
    ownerAddress: '',
    contractBalance: '',
    collectedFees: '',
    message: '',
    campaignTitle: '',
    pledgeCost: '',
    numberOfPledges: '',
    activeCampaigns: [],
    fulfilledCampaigns: [],
    canceledCampaigns: [],
    campaingIdToFund: '',
    campaignPledgeCost: '',
    deservesRefund: '',
    newContractOwner: '',
    addressToBan: '',
    bannedUsers: [],
    contractIsActive: '',
  };


  // This helps me to change the component's state no matter the event occured.
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };


  isPrivilegedUser = () => {
    return this.state.currentAddress.trim().toLowerCase() === this.state.ownerAddress.trim().toLowerCase();
  }


  isEligibleToCancelACampaign = (campaign) => {
    return this.state.currentAddress.trim().toLowerCase() === this.state.ownerAddress.trim().toLowerCase() ||
      this.state.currentAddress.trim().toLowerCase() === campaign.creatorAddress.trim().toLowerCase();
  }


  isUserBanned = () => {
    let banned = false;
    this.state.bannedUsers.forEach(
      (value) => { banned = banned || this.state.currentAddress.trim().toLowerCase() === value.trim().toLowerCase() }
    );
    return banned;
  }


  createCampaign = async (event) => {
    event.preventDefault();

    const { campaignTitle, pledgeCost, numberOfPledges, currentAddress } = this.state;

    try {
      await crowdfunding.methods.addNewCampaign(campaignTitle, pledgeCost, numberOfPledges)
        .send({ from: currentAddress, value: web3.utils.toWei("0.02", "ether") });

      this.setState({ campaignTitle: '', pledgeCost: '', numberOfPledges: '' }); // Prepare for new campaign
    } catch (error) {
      console.error('Error creating campaign:', error);
      this.setState({ message: 'Failed to create campaign' });
    }
  };


  makeAFund = async (campaignId, pledgeCost) => {
    try {
      await crowdfunding.methods.supportACampaign(campaignId)
        .send({ from: this.state.currentAddress, value: web3.utils.toWei(pledgeCost, "ether") });
    } catch (error) {
      console.log(error);
      this.setState({ message: "Funding failed" });
    }
  }


  cancelACampaign = async (campaignId) => {
    try {
      await crowdfunding.methods.cancelACampaign(campaignId).send({ from: this.state.currentAddress });
    } catch (error) {
      console.log(error);
    }
  }


  fulfillACampaign = async (campaignId) => {
    try {
      await crowdfunding.methods.fulfillACampaign(campaignId).send({ from: this.state.currentAddress });
    } catch (error) {
      console.log(error);
    }
  }


  getRefund = async () => {
    try {
      await crowdfunding.methods.refund().send({ from: this.state.currentAddress });
      this.setState({ deservesRefund: false });
    } catch (error) {
      console.log(error);
    }
  }


  withdraw = async () => {
    try {
      await crowdfunding.methods.transferAllFeesToContractOwner().send({ from: this.state.currentAddress });
    } catch (error) {
      console.log(error);
    }
  }


  changeOwner = async () => {
    try {
      await crowdfunding.methods.changeContractOwner(this.state.newContractOwner).send({ from: this.state.currentAddress });
      this.setState({ newContractOwner: '' });
    } catch (error) {
      console.log(error);
    }
  }


  banUser = async () => {
    try {
      await crowdfunding.methods.addUserToBanList(this.state.addressToBan).send({ from: this.state.currentAddress });
      const bannedUsers = await crowdfunding.methods.getBannedBackers().call();

      this.setState({ addressToBan: '', bannedUsers });
    } catch (error) {
      console.log(error);
    }
  }


  destroyTheContract = async () => {
    try {
      await crowdfunding.methods.destroyContract().send({ from: this.state.currentAddress });
      const contractIsActive = await crowdfunding.methods.checkIfContractIsActive().call();
      this.setState({ contractIsActive });

    } catch (error) {
      console.log(error);
    }
  }


  loadActiveCampaigns = async (callerAddress) => {
    try {

      const activeCampaignsData = await crowdfunding.methods.getActiveCampaigns().call({ from: callerAddress });

      const entrepreneurs = activeCampaignsData[0];
      const ids = activeCampaignsData[1];
      const pledgesCosts = activeCampaignsData[2];
      const pledgesCounts = activeCampaignsData[3];
      const pledgesUntilFulfill = activeCampaignsData[4];
      const currentBackerPledgesForEveryActiveCampaign = activeCampaignsData[5];
      const privilegesForThisBackerPerEveryActiveCampaign = activeCampaignsData[6];

      // Use entrepreneurs array to get the indexes and then use that indexes to find all the information contained inside the other arrays.
      const activeCampaigns = entrepreneurs.map((address, index) => ({
        creatorAddress: address,
        id: ids[index].toString(),
        pledgeCost: web3.utils.fromWei(pledgesCosts[index].toString(), "ether"),
        pledgesSold: pledgesCounts[index].toString(),
        pledgesRemaining: pledgesUntilFulfill[index].toString(),
        currentBackerPledges: currentBackerPledgesForEveryActiveCampaign[index].toString(),
        isPrivileged: privilegesForThisBackerPerEveryActiveCampaign[index]
      }));

      this.setState({ activeCampaigns });
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  }


  loadFulfilledCampaigns = async (callerAddress) => {
    try {

      const fulfilledCampaignsData = await crowdfunding.methods.getFulfilledCampaigns().call({ from: callerAddress });

      const entrepreneurs = fulfilledCampaignsData[0];
      const ids = fulfilledCampaignsData[1];
      const pledgesCosts = fulfilledCampaignsData[2];
      const pledgesCounts = fulfilledCampaignsData[3];
      const pledgesUntilFulfill = fulfilledCampaignsData[4];
      const currentBackerPledgesForEveryActiveCampaign = fulfilledCampaignsData[5];

      // Use entrepreneurs array to get the indexes and then use that indexes to find all the information contained inside the other arrays.
      const fulfilledCampaigns = entrepreneurs.map((address, index) => ({
        creatorAddress: address,
        id: ids[index].toString(),
        pledgeCost: web3.utils.fromWei(pledgesCosts[index].toString(), "ether"),
        pledgesSold: pledgesCounts[index].toString(),
        pledgesRemaining: pledgesUntilFulfill[index].toString(),
        currentBackerPledges: currentBackerPledgesForEveryActiveCampaign[index].toString(),
      }));

      this.setState({ fulfilledCampaigns });
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  }


  loadCanceledCampaigns = async (callerAddress) => {
    try {

      const canceledCampaignsData = await crowdfunding.methods.getCanceledCampaigns().call({ from: callerAddress });

      const entrepreneurs = canceledCampaignsData[0];
      const ids = canceledCampaignsData[1];
      const pledgesCosts = canceledCampaignsData[2];
      const pledgesCounts = canceledCampaignsData[3];
      const pledgesUntilFulfill = canceledCampaignsData[4];
      const currentBackerPledgesForEveryActiveCampaign = canceledCampaignsData[5];
      const deservesRefund = canceledCampaignsData[6];

      // Use entrepreneurs array to get the indexes and then use that indexes to find all the information contained inside the other arrays.
      const canceledCampaigns = entrepreneurs.map((address, index) => ({
        creatorAddress: address,
        id: ids[index].toString(),
        pledgeCost: web3.utils.fromWei(pledgesCosts[index].toString(), "ether"),
        pledgesSold: pledgesCounts[index].toString(),
        pledgesRemaining: pledgesUntilFulfill[index].toString(),
        currentBackerPledges: currentBackerPledgesForEveryActiveCampaign[index].toString(),
      }));

      this.setState({ canceledCampaigns, deservesRefund });
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  }


  loadPageData = async () => {
    // Get the information that is presented on the top of the page.
    const owner = (await crowdfunding.methods.getContractOwner().call()).trim().toLowerCase(); // This returns as a string
    const currBalance = web3.utils.fromWei(await crowdfunding.methods.getContractWholeBalance().call(), "ether");
    const fees = web3.utils.fromWei(await crowdfunding.methods.getContractFees().call(), "ether");
    const bannedUsers = await crowdfunding.methods.getBannedBackers().call();
    const contractIsActive = await crowdfunding.methods.checkIfContractIsActive().call();

    this.setState({ ownerAddress: owner, contractBalance: currBalance, collectedFees: fees, bannedUsers, contractIsActive });

    try {
      const currentAddress = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0].trim().toLowerCase();
      this.setState({ currentAddress });
      // Load all details for the campaigns.
      await this.loadActiveCampaigns(currentAddress);
      await this.loadFulfilledCampaigns(currentAddress);
      await this.loadCanceledCampaigns(currentAddress);
    } catch (error) {
      this.setState({ message: 'Metamask has not connected yet' });
    }
  }


  loadBalanceAndFees = async () => {
    const currBalance = web3.utils.fromWei(await crowdfunding.methods.getContractWholeBalance().call(), "ether");
    const fees = web3.utils.fromWei(await crowdfunding.methods.getContractFees().call(), "ether");

    this.setState({ contractBalance: currBalance, collectedFees: fees });

  }


  // componentDidMount() works like onLoad() method
  async componentDidMount() {
    this.loadPageData();
    if (!this.eventListenersSet) {
      this.setupEventListeners();
      this.eventListenersSet = true;
    }
  }


  setupEventListeners() {
    // Update current address
    window.ethereum.on('accountsChanged', async (addresses) => {
      const currAddr = addresses[0].trim().toLowerCase();
      this.setState({ currentAddress: currAddr });
      await this.loadActiveCampaigns(currAddr);
      await this.loadFulfilledCampaigns(currAddr);
      await this.loadCanceledCampaigns(currAddr);
    });

    // Catch the CampaignCreated event and update active campaigns.
    crowdfunding.events.CampaignCreated()
      .on('data', async (event) => {
        console.log('New Campaign Created:', event.returnValues);
        await this.loadBalanceAndFees();
        await this.loadActiveCampaigns(this.state.currentAddress);
      });

    // Update the live campaign section if a user make a new pledge
    crowdfunding.events.PledgeMade()
      .on('data', async (event) => {
        console.log('Pledge Made:', event.returnValues);
        await this.loadBalanceAndFees();
        await this.loadActiveCampaigns(this.state.currentAddress);
      });

    // Update the canceled campaigns section
    crowdfunding.events.CampaignCanceled()
      .on('data', async (event) => {
        console.log('Campaign Canceled:', event.returnValues);
        await this.loadActiveCampaigns(this.state.currentAddress);
        await this.loadCanceledCampaigns(this.state.currentAddress);
      });

    crowdfunding.events.RefundMade()
      .on('data', async (event) => {
        console.log('Refund Made', event.returnValues);
        await this.loadBalanceAndFees();
        await this.loadCanceledCampaigns(this.state.currentAddress);
      });

    crowdfunding.events.CampaignFulfilled()
      .on('data', async (event) => {
        console.log('Campaign Fulfilled:', event.returnValues);
        await this.loadBalanceAndFees();
        await this.loadActiveCampaigns(this.state.currentAddress);
        await this.loadFulfilledCampaigns(this.state.currentAddress);
      });

    crowdfunding.events.WithdrawMade()
      .on('data', async (event) => {
        console.log('Withdraw made:', event.returnValues);
        await this.loadBalanceAndFees();
      });

    crowdfunding.events.OwnerChanged()
      .on('data', async (event) => {
        console.log("Owner changed.", event.returnValues);
        const owner = await crowdfunding.methods.getContractOwner().call(); // This returns as a string
        this.setState({ ownerAddress: owner });
      })

    crowdfunding.events.UserBanned()
      .on('data', async (event) => {
        console.log("User is banned", event.returnValues);
        const bannedUsers = await crowdfunding.methods.getBannedBackers().call();
        this.setState({ bannedUsers });
        await this.loadPageData();
      })

    crowdfunding.events.ContractDestroyed()
      .on('data', async (event) => {
        console.log("Contract is destroyed", event.returnValues);
        const contractIsActive = await crowdfunding.methods.checkIfContractIsActive().call();
        this.setState({ contractIsActive });
        await this.loadPageData();
      })

  }


  // This method get's called when the component's state changes.
  render() {
    return (
      <div>

        <header class="header">
          <h1>Crowdfunding DApp</h1>

          <div class="wallet-details">
            <div class="addresses">
              <p>Current Address <input type="text" class="form-control" id="current-addr" value={this.state.currentAddress} readOnly /></p>
              <p>Owner's Address <input type="text" class="form-control" id="owner-addr" value={this.state.ownerAddress} readOnly /></p>
            </div>
            <div class="balances">
              <p>Balance <input type="text" class="form-control" id="contract-balance" value={this.state.contractBalance} readOnly /></p>
              <p>Collected Fees <input type="text" class="form-control" id="collected-fees" value={this.state.collectedFees} readOnly /></p>
            </div>
          </div>
        </header>

        <hr />

        <section class="new-campaign">
          <h2>New Campaign</h2>

          <form onSubmit={this.createCampaign}>
            <div class="new-campaign-title-container"><label>Title: <input type="text" class="form-control" id="campaign-title" name="campaignTitle" value={this.state.campaignTitle} onChange={this.handleInputChange} placeholder="Enter a title" /></label><br /></div>
            <div class="new-campaign-pledge-cost-container"><label>Pledge cost: <input type="number" class="form-control" id="pledge-cost" name="pledgeCost" value={this.state.pledgeCost} onChange={this.handleInputChange} /></label><br /></div>
            <div class="new-campaign-number-of-pledges-container"><label>Number of pledges: <input type="number" class="form-control" id="number-of-pledges" name="numberOfPledges" value={this.state.numberOfPledges} onChange={this.handleInputChange} /></label><br /></div>
            <button type="submit" id="create-campaign-btn" class={`btn ${this.isPrivilegedUser() || this.isUserBanned() || !this.state.contractIsActive ? 'btn-grey' : 'btn-blue'}`} disabled={this.isPrivilegedUser() || this.isUserBanned() || !this.state.contractIsActive}>Create</button>
          </form>
        </section>

        <hr />

        <section class="live-campaigns">
          <h2>Live campaigns</h2>

          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Entrepreneur</th>
                <th>Title</th>
                <th>Price</th>
                <th>Pledges Sold</th>
                <th>Pledges Left</th>
                <th>Your Pledges</th>
              </tr>
            </thead>
            <tbody>
              {this.state.activeCampaigns.map((campaign, index) => (
                <tr key={index}>
                  <td>{campaign.creatorAddress.toString()}</td>
                  <td>{campaign.id.toString()}</td>
                  <td>{campaign.pledgeCost.toString()}</td>
                  <td>{campaign.pledgesSold.toString()}</td>
                  <td>{campaign.pledgesRemaining.toString()}</td>
                  <td>{campaign.currentBackerPledges.toString()}</td>
                  <button class="btn btn-green" onClick={() => {
                    this.makeAFund(campaign.id, campaign.pledgeCost);
                  }}>Pledge</button>
                  <button class="btn btn-red" hidden={!this.isPrivilegedUser() && !(campaign.creatorAddress.trim().toLowerCase() === this.state.currentAddress.trim().toLowerCase())}
                    disabled={!this.isEligibleToCancelACampaign(campaign)} onClick={() => {
                      this.cancelACampaign(campaign.id);
                    }}>Cancel</button>
                  <button class={`btn ${campaign.pledgesRemaining > 0 ? 'btn-grey' : 'btn-blue'}`} hidden={!this.isPrivilegedUser() && !(campaign.creatorAddress.trim().toLowerCase() === this.state.currentAddress.trim().toLowerCase())}
                    disabled={campaign.pledgesRemaining > 0} onClick={() => {
                      this.fulfillACampaign(campaign.id);
                    }}>Fulfill</button>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr />

        <section class="fulfilled-campaigns">
          <h2>Fulfilled campaigns</h2>

          <table>
            <thead>
              <tr>
                <th>Entrepreneur</th>
                <th>Title</th>
                <th>Price</th>
                <th>Pledges Sold</th>
                <th>Pledges Left</th>
                <th>Your Pledges</th>
              </tr>
            </thead>
            <tbody>
              {this.state.fulfilledCampaigns.map((campaign, index) => (
                <tr key={index}>
                  <td>{campaign.creatorAddress.toString()}</td>
                  <td>{campaign.id.toString()}</td>
                  <td>{campaign.pledgeCost.toString()}</td>
                  <td>{campaign.pledgesSold.toString()}</td>
                  <td>{campaign.pledgesRemaining.toString()}</td>
                  <td>{campaign.currentBackerPledges.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </section>

        <hr />

        <section class="canceled-campaigns">
          <h2>Canceled campaigns</h2>

          <button class={`btn ${!this.state.deservesRefund ? 'btn-grey' : 'btn-blue'}`} disabled={!this.state.deservesRefund} onClick={this.getRefund}>Claim</button>

          <table>
            <thead>
              <tr>
                <th>Entrepreneur</th>
                <th>Title</th>
                <th>Price</th>
                <th>Pledges Sold</th>
                <th>Pledges Left</th>
                <th>Your Pledges</th>
              </tr>
            </thead>

            <tbody>
              {this.state.canceledCampaigns.map((campaign, index) => (
                <tr key={index}>
                  <td>{campaign.creatorAddress.toString()}</td>
                  <td>{campaign.id.toString()}</td>
                  <td>{campaign.pledgeCost.toString()}</td>
                  <td>{campaign.pledgesSold.toString()}</td>
                  <td>{campaign.pledgesRemaining.toString()}</td>
                  <td>{campaign.currentBackerPledges.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <hr />

        <section class="control-panel">
          <h2>Control Panel</h2>

          <div class="control-panel-container">
            <div class="control-buttons">
              <button class={`btn ${this.isPrivilegedUser() && this.state.contractIsActive ? 'btn-blue' : 'btn-grey'}`} disabled={!this.isPrivilegedUser() || !this.state.contractIsActive} onClick={this.withdraw}>Withdraw</button>
            </div>

            <div class="form-inline">
              <button class={`btn ${this.isPrivilegedUser() && this.state.contractIsActive ? 'btn-blue' : 'btn-grey'}`} disabled={!this.isPrivilegedUser() || !this.state.contractIsActive} onClick={this.changeOwner}>Change owner</button>
              <input type="text" class="form-control" id="new-contract-owner-input" name="newContractOwner" value={this.state.newContractOwner} onChange={this.handleInputChange} />
            </div>

            <div class="form-inline">
              <button class={`btn ${this.isPrivilegedUser() && this.state.contractIsActive ? 'btn-blue' : 'btn-grey'}`} disabled={!this.isPrivilegedUser() || !this.state.contractIsActive} onClick={this.banUser}>Ban entrepreneur</button>
              <input type="text" class="form-control" id="ban-user-input" name="addressToBan" value={this.state.addressToBan} onChange={this.handleInputChange} />
            </div>

            <div class="control-buttons">
              <button class={`btn ${this.isPrivilegedUser() && this.state.contractIsActive ? 'btn-blue' : 'btn-grey'}`} disabled={!this.isPrivilegedUser() || !this.state.contractIsActive} onClick={this.destroyTheContract}>Destroy</button>
            </div>
          </div>

        </section>

      </div>
    )
  }
}

export default App;