import { providers, Signer, Contract, utils } from 'ethers'
import { EMPTY_DATA, ZERO_ADDRESS } from './constants'
import { SafeAccountConfiguration } from './types'

import GnosisSafe from './abis/GnosisSafe.json'
import GnosisSafeProxyFactory from './abis/GnosisSafeProxyFactory.json'

export const createGnosisSafeProxyFactoryContract = (proxyFactoryAddress: string, signer: Signer) => new Contract(
  proxyFactoryAddress,
  GnosisSafeProxyFactory.abi,
  signer
)

export const validateIsDeployedFactory =
  (signerOrProvider: providers.Provider) =>
  (address: string, name: string): Promise<void> =>
    signerOrProvider.getCode(address).then((code: string) => {
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
