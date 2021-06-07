import { providers, Signer, Contract, utils } from 'ethers'
import { EMPTY_DATA } from './constants'

import GnosisSafe from './GnosisSafe.json'
import GnosisSafeProxyFactory from './GnosisSafeProxyFactory.json'

export const createGnosisSafeProxyFactoryContract = (proxyFactoryAddress: string, signer: Signer) => new Contract(
  proxyFactoryAddress,
  GnosisSafeProxyFactory.abi,
  signer
)

export const createGnosisSageInterface = () => new utils.Interface(GnosisSafe.abi)

export const validateIsDeployedFactory =
  (signerOrProvider: providers.Provider) =>
  (address: string, name: string): Promise<void> =>
    signerOrProvider.getCode(address).then((code: string) => {
      if (code === EMPTY_DATA) {
        throw new Error(`${name} contract is not deployed in the current network`)
      }
    })
