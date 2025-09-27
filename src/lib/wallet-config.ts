import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  arbitrum, 
  base, 
  mainnet, 
  optimism, 
  polygon,
  sepolia,
  polygonMumbai
} from 'wagmi/chains';

// Custom Filecoin chains (if not available in wagmi/chains)
const filecoinMainnet = {
  id: 314,
  name: 'Filecoin Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Filecoin',
    symbol: 'FIL',
  },
  rpcUrls: {
    default: {
      http: ['https://api.node.glif.io'],
    },
  },
  blockExplorers: {
    default: { name: 'FileScan', url: 'https://filfox.info/en' },
  },
} as const;

const filecoinCalibrationTestnet = {
  id: 314159,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'Test Filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
    },
  },
  blockExplorers: {
    default: { name: 'FileScan', url: 'https://calibration.filfox.info/en' },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: 'Polyverse Creator Storefront',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fcd3420b61e039382c67c578b42abe70',
  chains: [
    filecoinCalibrationTestnet,
    filecoinMainnet,
    mainnet, 
    polygon, 
    optimism, 
    arbitrum, 
    base,
    sepolia,
    polygonMumbai
  ],
  ssr: true,
});