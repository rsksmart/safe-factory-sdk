import { Signer, Event, ethers } from 'ethers'
import EthersSafe, { Safe } from '@gnosis.pm/safe-core-sdk'
import { SafeAccountConfiguration } from './types'
import { validateIsDeployedFactory, createGnosisSafeProxyFactoryContract, createGnosisSafeSetupCallData } from './contracts'

const validateSafeCreationParams = (owners: string[], threshold: number) => {
  if (owners.length <= 0)
    throw new Error('Invalid owners: it must have at least one')
  if (threshold <= 0)
    throw new Error('Invalid threshold: it must be greater than or equal to 0')
  if (threshold > owners.length)
    throw new Error('Invalid threshold: it must be lower than or equal to owners length')
}


export interface DeploymentOptions {
  nonce?: number
  callbackAddress?: string
}

class EthersSafeFactory {
  #signer!: Signer
  #proxyFactoryAddress!: string
  #safeSingletonAddress!: string
  validateContractsAreDeployed: () => Promise<void>

  constructor(signer: Signer, proxyFactoryAddress: string, safeSingletonAddress: string) {
    this.#signer = signer
    this.#proxyFactoryAddress = proxyFactoryAddress
    this.#safeSingletonAddress = safeSingletonAddress

    if (!this.#signer.provider) {
      throw new Error('Signer must be connected to a provider')
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const validateIsDeployed = validateIsDeployedFactory(this.#signer.provider!)
    this.validateContractsAreDeployed = async () => {
      await validateIsDeployed(this.#proxyFactoryAddress, 'ProxyFactory')
      await validateIsDeployed(this.#safeSingletonAddress, 'SafeSingleton')
    }
  }

  async createSafe(
    safeAccountConfiguration: SafeAccountConfiguration,
    deploymentOptions?: DeploymentOptions
  ): Promise<Safe> {
    /**
     * r4: extract methods
     * 1) validate params
     * 2) validate instance
     * 3) create proxy transaction
     * 4) deploy proxy
     * 5) recover address
     */
    validateSafeCreationParams(safeAccountConfiguration.owners, safeAccountConfiguration.threshold)
    await this.validateContractsAreDeployed()
    const setupCallData = createGnosisSafeSetupCallData(safeAccountConfiguration)

    const gnosisSafeAddress = await this.deployProxy(deploymentOptions, setupCallData)
    return await EthersSafe.create(ethers, gnosisSafeAddress, this.#signer)
  }

  private async createDeployProxyTransaction(
    deploymentOptions: DeploymentOptions = {},
    data: string
  ) {
    const proxyFactory = createGnosisSafeProxyFactoryContract(
      this.#proxyFactoryAddress,
      this.#signer
    )

    const { nonce, callbackAddress } = deploymentOptions

    if (callbackAddress && nonce) {
      return await proxyFactory.createProxyWithCallback(
        this.#safeSingletonAddress,
        data,
        nonce,
        callbackAddress
      )
    } else if (nonce) {
      return await proxyFactory.createProxyWithNonce(this.#safeSingletonAddress, data, nonce)
    } else {
      return await proxyFactory.createProxy(this.#safeSingletonAddress, data)
    }
  }

  private async deployProxy(deploymentOptions: DeploymentOptions = {}, setupFnData: string): Promise<string> {
    const receipt = await this.createDeployProxyTransaction(deploymentOptions, setupFnData).then(
      (tx) => tx.wait()
    )
    const proxyCreationEvent = receipt.events?.find((e: Event) => e.event === 'ProxyCreation')
    if (!proxyCreationEvent || !proxyCreationEvent.args) {
      throw new Error(
        'Proxy creation failed: check if the proxy has been deployed correctly and try again'
      )
    }
    const proxyAddress = proxyCreationEvent.args[0]
    return proxyAddress
  }
}

export default EthersSafeFactory
