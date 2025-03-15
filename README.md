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
- A local Ethereum test network (e.g., Ganache) or a public testnet

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/thanosmoschou/crowdfunding-dapp.git
   cd crowdfunding-dapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
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


