<p align="middle">
  <img src="https://www.rifos.org/assets/img/logo.svg" alt="logo" height="100" >
</p>
<h3 align="middle"><code>@rsksmart/safe-factory-sdk</code></h3>
<p align="middle">
    RIF Safe Factory SDK
</p>
<p align="middle">
  <a href="https://github.com/rsksmart/safe-factory-sdk/actions?query=workflow%3Aci">
    <img src="https://github.com/rsksmart/safe-factory-sdk/workflows/ci/badge.svg" />
  </a>
  <a href="https://lgtm.com/projects/g/rsksmart/safe-factory-sdk/context:javascript">
    <img src="https://img.shields.io/lgtm/grade/javascript/github/rsksmart/safe-factory-sdk" />
  </a>
  <a href='https://coveralls.io/github/rsksmart/safe-factory-sdk?branch=main'>
    <img src='https://coveralls.io/repos/github/rsksmart/safe-factory-sdk/badge.svg?branch=main' alt='Coverage Status' />
  </a>
  <a href="https://badge.fury.io/js/%40rsksmart%2Fsafe-factory-sdk">
    <img src="https://badge.fury.io/js/%40rsksmart%2Fsafe-factory-sdk.svg" alt="npm" />
  </a>
</p>


```
npm i @rsksmart/safe-factory-sdk
```

## Create a Safe account

It requires that both the [GnosisSafeProxyFactory](https://github.com/gnosis/safe-contracts/blob/v1.2.0/contracts/proxies/GnosisSafeProxyFactory.sol) and the [GnosisSafe](https://github.com/gnosis/safe-contracts/blob/v1.2.0/contracts/GnosisSafe.sol) have been deployed.

```js
import { EthersSafeFactory } from '@rsksmart/safe-factory-sdk'

const proxyFactoryAddress = '0x<GnosisSafeProxyFactory address here>'
const safeSingletonAddress = '0x<GnosisSafe address here>'

const ethersSafeFactory = new EthersSafeFactory(
  signer,
  proxyFactoryAddress,
  safeSingletonAddress
)

const safeSdk = await ethersSafeFactory.createSafe({
  owners: ['0x1234...', '0xabcd...', '0x0987...'],
  threshold: 2
})
```

For the SafeSDK usage, please have a look at the [official documentation](https://docs.gnosis.io/safe/docs/sdks_core/).

## Run for development

Install dependencies:

```
npm i
```

### Run a local network

```
npx hardhat node
```

### Tests

Run unit tests with

```
npx hardhat test
```

With Coverage:
```
npm run test:coverage
```

### Lint & formatting

```
npm run format
npm run lint
```

### Build

```
npm run build
```

