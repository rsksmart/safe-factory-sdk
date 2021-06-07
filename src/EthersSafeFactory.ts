import { Signer, Event, ethers, Contract, ContractTransaction } from 'ethers'
import EthersSafe, { Safe } from '@gnosis.pm/safe-core-sdk'
import { SafeAccountConfiguration, DeploymentOptions } from './types'
import { validateIsDeployedFactory, createGnosisSafeProxyFactoryContract, createGnosisSafeSetupCallData, recoverDeployedProxy, createDeployProxyTransactionFactory } from './contracts'

const validateSafeCreationParams = (owners: string[], threshold: number) => {
  if (owners.length <= 0)
    throw new Error('Invalid owners: it must have at least one')
  if (threshold <= 0)
    throw new Error('Invalid threshold: it must be greater than or equal to 0')
  if (threshold > owners.length)
    throw new Error('Invalid threshold: it must be lower than or equal to owners length')
}

class EthersSafeFactory {
  public signer: Signer
  public safeSingletonAddress: string
  public proxyFactoryAddress: string

  private validateContractsAreDeployed: () => Promise<void>
  private createDeployProxyTransaction: (data: string, deploymentOptions?: DeploymentOptions) => Promise<ContractTransaction>

  constructor(signer: Signer, proxyFactoryAddress: string, safeSingletonAddress: string) {
    this.signer = signer
    this.proxyFactoryAddress = proxyFactoryAddress
    this.safeSingletonAddress = safeSingletonAddress

    if (!this.signer.provider) {
      throw new Error('Signer must be connected to a provider')
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validateIsDeployed = validateIsDeployedFactory(this.signer.provider)
    this.validateContractsAreDeployed = async () => {
      await validateIsDeployed(proxyFactoryAddress, 'ProxyFactory')
      await validateIsDeployed(safeSingletonAddress, 'SafeSingleton')
    }

    const proxyFactory = createGnosisSafeProxyFactoryContract(proxyFactoryAddress, signer)
    this.createDeployProxyTransaction = createDeployProxyTransactionFactory(proxyFactory, safeSingletonAddress)
  }

  async createSafe(
    safeAccountConfiguration: SafeAccountConfiguration,
    deploymentOptions?: DeploymentOptions
  ): Promise<Safe> {
    validateSafeCreationParams(safeAccountConfiguration.owners, safeAccountConfiguration.threshold)
    await this.validateContractsAreDeployed()
    const setupCallData = createGnosisSafeSetupCallData(safeAccountConfiguration)
    const tx = await this.createDeployProxyTransaction(setupCallData, deploymentOptions)
    const receipt = await tx.wait()
    const gnosisSafeAddress = await recoverDeployedProxy(receipt)

    return await EthersSafe.create(ethers, gnosisSafeAddress, this.signer)
  }
}

export default EthersSafeFactory
