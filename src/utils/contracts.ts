import { providers, Signer, Contract } from 'ethers'
import { EMPTY_DATA } from './constants'

import GnosisSafeProxyFactory from './GnosisSafeProxyFactory.json' // r1: remove dep

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
