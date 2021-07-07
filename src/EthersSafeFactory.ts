import { Signer, ethers, ContractTransaction } from 'ethers'
import EthersSafe, { Safe } from '@gnosis.pm/safe-core-sdk'
import { SafeAccountConfiguration, DeploymentOptions } from './types'
import {
  validateCreationParams,
  validateIsDeployedFactory,
  createGnosisSafeProxyFactoryContract,
  createSetupCallData,
  recoverDeployedProxy,
  deployProxyFactory
} from './contracts'
import { MAINNET_SAFE_DEPLOYMENT, TESTNET_SAFE_DEPLOYMENT } from './constants'

class EthersSafeFactory {
  private signer: Signer

  private validateContractsAreDeployed: () => Promise<void>
  private deployProxy: (
    data: string,
    deploymentOptions?: DeploymentOptions
  ) => Promise<ContractTransaction>

  constructor(signer: Signer, proxyFactoryAddress: string, safeSingletonAddress: string) {
    this.signer = signer

    if (!signer.provider) {
      throw new Error('Signer must be connected to a provider')
    }

    const validateIsDeployed = validateIsDeployedFactory(signer.provider)
    this.validateContractsAreDeployed = async () => {
      await validateIsDeployed(proxyFactoryAddress, 'ProxyFactory')
      await validateIsDeployed(safeSingletonAddress, 'SafeSingleton')
    }

    const proxyFactory = createGnosisSafeProxyFactoryContract(proxyFactoryAddress, signer)
    this.deployProxy = deployProxyFactory(proxyFactory, safeSingletonAddress)
  }

  async createSafe(
    safeAccountConfiguration: SafeAccountConfiguration,
    deploymentOptions?: DeploymentOptions
  ): Promise<Safe> {
    validateCreationParams(safeAccountConfiguration.owners, safeAccountConfiguration.threshold)
    await this.validateContractsAreDeployed()
    const setupCallData = createSetupCallData(safeAccountConfiguration)
    const tx = await this.deployProxy(setupCallData, deploymentOptions)
    const receipt = await tx.wait()
    const gnosisSafeAddress = await recoverDeployedProxy(receipt)
    return await EthersSafe.create(ethers, gnosisSafeAddress, this.signer)
  }

  public static createSafeFactoryOnRskTestnet = (signer: Signer): EthersSafeFactory =>
    new EthersSafeFactory(
      signer,
      TESTNET_SAFE_DEPLOYMENT.proxyFactoryAddress,
      TESTNET_SAFE_DEPLOYMENT.safeSingletonAddress
    )

  public static createSafeFactoryOnRskMainnet = (signer: Signer): EthersSafeFactory =>
    new EthersSafeFactory(
      signer,
      MAINNET_SAFE_DEPLOYMENT.proxyFactoryAddress,
      MAINNET_SAFE_DEPLOYMENT.safeSingletonAddress
    )
}

export default EthersSafeFactory
