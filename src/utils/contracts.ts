import { providers, Signer, Contract } from 'ethers'
import { EMPTY_DATA } from './constants'
import { Interface } from '@ethersproject/abi'  // r3: use ContractInterface

import GnosisSafe from './GnosisSafe.json'
import GnosisSafeProxyFactory from './GnosisSafeProxyFactory.json'

export const createGnosisSafeProxyFactoryContract = (proxyFactoryAddress: string, signer: Signer) => new Contract(
  proxyFactoryAddress,
  GnosisSafeProxyFactory.abi,
  signer
)

export const createGnosisSageInterface = () => new Interface(GnosisSafe.abi)

export const validateIsDeployedFactory =
  (signerOrProvider: providers.Provider) =>
  (address: string, name: string): Promise<void> =>
    signerOrProvider.getCode(address).then((code: string) => {
      if (code === EMPTY_DATA) {
        throw new Error(`${name} contract is not deployed in the current network`)
      }
    })
