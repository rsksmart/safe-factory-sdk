import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
export default {
  solidity: {
    compilers: [{ version: '0.5.17' }]
  },
  paths: {
    artifacts: 'artifacts',
    deploy: 'hardhat/deploy',
    sources: 'contracts',
    tests: 'test'
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 100000000,
      gas: 100000000
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
}
