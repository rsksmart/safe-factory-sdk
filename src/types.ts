export interface SafeAccountConfiguration {
  owners: string[]
  threshold: number
  to?: string
  data?: string
  fallbackHandler?: string
  paymentToken?: string
  payment?: number
  paymentReceiver?: string
}

export interface DeploymentOptions {
  nonce?: number
  callbackAddress?: string
}
