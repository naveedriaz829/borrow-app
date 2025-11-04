import { http } from 'wagmi'
import { createConfig } from 'wagmi'
import { worldchain } from './chains'

export const config = createConfig({
  chains: [worldchain],
  transports: {
    [worldchain.id]: http(worldchain.rpcUrls.private.http[0]),
  },
}) 