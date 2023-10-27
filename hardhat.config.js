require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    goerli: {
      url: process.env.ALCHEMY_TESTNET_RPC_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY]
    }
  }
};

/// npx hardhat test
/// npx hardhat run scripts/deploy.js
/// npx hardhat run scripts/deploy.js --verbose
/// npx hardhat run scripts/deploy.js --network goerli
/// npx hardhat run scripts/deploy.js --network goerli --verbose


/*

Proxy Deployed: 0xd00039a170E94e82bd6Cf36a23663aa10471291A
Logic1 Deployed: 0x2Ad68214dD9510a67c7d471c386671D954b0b1c9
Logic2 Deployed: 0x71710d22618eF62a8D16dC82117ad00B96987576

Verify Tx: 0x7c2aef5bf5ed218bd5b52f76a98b8764fd76be796188b5754ba6f2863c0202b5

*/

