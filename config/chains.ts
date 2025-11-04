export const worldchain = {
  id: 480,
  name: 'Worldchain',
  network: 'worldchain',
  nativeCurrency: {
    decimals: 18,
    name: 'Worldcoin',
    symbol: 'WLD',
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || ''] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL || ''] },
    private: { http: [process.env.NEXT_PUBLIC_RPC_URL || ''] },
  },
  blockExplorers: {
    default: { name: 'Worldscan', url: 'https://worldscan.org' },
  },
} as const