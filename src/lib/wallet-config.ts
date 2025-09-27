import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  arbitrum, 
  base, 
  mainnet, 
  optimism, 
  polygon,
  sepolia,
  polygonMumbai,
  filecoin,
  filecoinCalibration
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
    public: {
      http: ['https://api.node.glif.io'],
    },
  },
  blockExplorers: {
    default: { name: 'FileScan', url: 'https://filfox.info/en' },
  },
};

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
    public: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
    },
  },
  blockExplorers: {
    default: { name: 'FileScan', url: 'https://calibration.filfox.info/en' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'Polyverse Creator Storefront',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
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
  ssr: true, // If your dApp uses server side rendering (SSR)
});