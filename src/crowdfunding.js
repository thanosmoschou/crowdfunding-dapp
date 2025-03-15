import web3 from "./web3";

const address = "<Contract address>";

const abi = [/* Contract's ABI */]

const crowdfunding = new web3.eth.Contract(abi, address);

export default crowdfunding;