import { providers, Signer, Contract, utils, ContractReceipt, Event, ContractTransaction } from 'ethers'
import { EMPTY_DATA, ZERO_ADDRESS } from './constants'
import { SafeAccountConfiguration, DeploymentOptions } from './types'

import GnosisSafe from './abis/GnosisSafe.json'
import GnosisSafeProxyFactory from './abis/GnosisSafeProxyFactory.json'

export const createGnosisSafeProxyFactoryContract = (proxyFactoryAddress: string, signer: Signer) => new Contract(
  proxyFactoryAddress,
  GnosisSafeProxyFactory.abi,
  signer
)

export const validateIsDeployedFactory =
  (provider: providers.Provider) =>
  (address: string, name: string): Promise<void> =>
  provider.getCode(address).then((code: string) => {
      if (code === EMPTY_DATA) {
        throw new Error(`${name} contract is not deployed in the current network`)
      }
    })

export const createGnosisSafeSetupCallData = ({
  owners,
  threshold,
  to = ZERO_ADDRESS,
  data = EMPTY_DATA,
  fallbackHandler = ZERO_ADDRESS,
  paymentToken = ZERO_ADDRESS,
  payment = 0,
  paymentReceiver = ZERO_ADDRESS
}: SafeAccountConfiguration) => new utils.Interface(GnosisSafe.abi).encodeFunctionData('setup', [
  owners,
  threshold,
  to,
  data,
  fallbackHandler,
  paymentToken,
  payment,
  paymentReceiver
])

export const createDeployProxyTransactionFactory = (proxyFactory: Contract, safeSingletonAddress: string) => (
  data: string,
  { nonce, callbackAddress }: DeploymentOptions = {},
): Promise<ContractTransaction> => {
  if (callbackAddress && nonce) {
    return proxyFactory.createProxyWithCallback(
      safeSingletonAddress,
      data,
      nonce,
      callbackAddress
    )
  } else if (nonce) {
    return proxyFactory.createProxyWithNonce(safeSingletonAddress, data, nonce)
  } else {
    return proxyFactory.createProxy(safeSingletonAddress, data)
  }
}

export const recoverDeployedProxy = (receipt: ContractReceipt): Promise<string> =>{
  const proxyCreationEvent = receipt.events?.find((e: Event) => e.event === 'ProxyCreation')
  if (!proxyCreationEvent || !proxyCreationEvent.args) {
    throw new Error(
      'Proxy creation failed: check if the proxy has been deployed correctly and try again'
    )
  }
  const proxyAddress = proxyCreationEvent.args[0]
  return proxyAddress
}
