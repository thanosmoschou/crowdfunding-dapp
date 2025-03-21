# Crowdfunding DApp

## Description
This is a simple decentralized crowdfunding application built with React and Solidity. The application allows users to create, fund, and manage crowdfunding campaigns using smart contracts deployed on the Ethereum blockchain.

## Features
- Create new crowdfunding campaigns.
- Fund campaigns by pledging Ethereum.
- Cancel campaigns if necessary.
- Fulfill successful campaigns.
- Claim refunds for canceled campaigns.
- Withdraw collected fees as the contract owner.
- Manage banned users.
- Change contract ownership.
- Destroy the contract if needed.

## Installation

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MetaMask](https://metamask.io/) (for interacting with the blockchain)
- [Ganache](https://trufflesuite.com/ganache/) (for a local Ethereum test network)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/thanosmoschou/crowdfunding-dapp.git
   cd crowdfunding-dapp
   ```
2. Compile the smart contract using Remix IDE:
   - Open [Remix IDE](https://remix.ethereum.org/).
   - Load your Solidity smart contract.
   - Compile the contract using the Solidity compiler.
3. Deploy the smart contract to Ganache:
   - In Remix, select "Injected Provider - MetaMask" as the environment.
   - Connect MetaMask to your local Ganache network.
   - Deploy the contract and copy the contract address.
4. Retrieve the contract's address and ABI, then update `crowdfunding.js` which is under the `src` folder, with these values.
5. Install dependencies:
   ```bash
   npm install
   ```
6. Start the development server:
   ```bash
   npm start
   ```

## Usage
- Connect your MetaMask wallet.
- Create a new campaign by entering a title, pledge cost, and number of pledges.
- Fund campaigns by pledging Ethereum.
- View active, fulfilled, and canceled campaigns.
- Manage campaigns if you are the contract owner or the creator.
- Claim refunds if eligible.

## Smart Contract
The application interacts with a smart contract that handles:
- Campaign creation and funding
- Campaign fulfillment and cancellation
- Fund withdrawal by the contract owner
- User banning and contract self-destruction

## Technologies Used
- React
- Solidity
- Web3.js
- Ethereum blockchain
- MetaMask
- Ganache
- Remix IDE

