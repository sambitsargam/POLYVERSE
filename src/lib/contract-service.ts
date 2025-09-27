import { 
  readContract, 
  writeContract, 
  waitForTransactionReceipt,
  getAccount,
  getChainId
} from '@wagmi/core';
import { parseUnits, formatUnits } from 'viem';
import { config } from '@/lib/wallet-config';
import { 
  CONTRACT_ADDRESSES, 
  POLYVERSE_STOREFRONT_ABI, 
  ERC20_ABI 
} from '@/lib/contracts';

export class PolyverseContractService {
  
  /**
   * Get the contract address for the current chain
   */
  private getContractAddress(contractName: keyof typeof CONTRACT_ADDRESSES[314159]) {
    const chainId = getChainId(config);
    const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
    
    if (!addresses) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    
    return addresses[contractName];
  }

  // READ FUNCTIONS

  /**
   * Get creator information
   */
  async getCreator(creatorAddress: string) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'creators',
      args: [creatorAddress as `0x${string}`],
    });

    const [wallet, handle, name, isVerified, totalEarnings, subscriberCount, isActive, createdAt] = result as readonly [`0x${string}`, string, string, boolean, bigint, bigint, boolean, bigint];

    return {
      wallet,
      handle,
      name,
      isVerified,
      totalEarnings: Number(totalEarnings) / 100,
      subscriberCount: Number(subscriberCount),
      isActive,
      createdAt: Number(createdAt),
    };
  }

  /**
   * Get creator by handle
   */
  async getCreatorByHandle(handle: string) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'getCreatorByHandle',
      args: [handle],
    });

    const [wallet, creatorHandle, name, isVerified, totalEarnings, subscriberCount, isActive, createdAt] = result as readonly [`0x${string}`, string, string, boolean, bigint, bigint, boolean, bigint];

    return {
      wallet,
      handle: creatorHandle,
      name,
      isVerified,
      totalEarnings: Number(totalEarnings) / 100,
      subscriberCount: Number(subscriberCount),
      isActive,
      createdAt: Number(createdAt),
    };
  }

  /**
   * Get product information
   */
  async getProduct(productId: number) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'products',
      args: [BigInt(productId)],
    });

    const [id, creator, title, description, priceUSD, contentHash, productType, isActive, purchaseCount, createdAt] = result as readonly [bigint, `0x${string}`, string, string, bigint, string, string, boolean, bigint, bigint];

    return {
      id: Number(id),
      creator,
      title,
      description,
      priceUSD: Number(priceUSD) / 100,
      contentHash,
      productType,
      isActive,
      purchaseCount: Number(purchaseCount),
      createdAt: Number(createdAt),
    };
  }

  /**
   * Get all products for a creator
   */
  async getCreatorProducts(creatorAddress: string) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'getProductsByCreator',
      args: [creatorAddress as `0x${string}`],
    });

    return Array.from(result as readonly bigint[]).map(id => Number(id));
  }

  /**
   * Check if user has access to a product
   */
  async checkProductAccess(userAddress: string, productId: number) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const result = await readContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'checkAccess',
      args: [userAddress as `0x${string}`, BigInt(productId)],
    });

    return result as boolean;
  }

  // WRITE FUNCTIONS (require wallet connection and signing)

  /**
   * Register as a creator
   */
  async registerCreator(handle: string, name: string) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const hash = await writeContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'registerCreator',
      args: [handle, name],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  }

  /**
   * Create a new product
   */
  async createProduct(
    title: string,
    description: string,
    priceUSD: number,
    contentHash: string,
    productType: string
  ) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    const priceInCents = Math.round(priceUSD * 100);
    
    const hash = await writeContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'createProduct',
      args: [title, description, BigInt(priceInCents), contentHash, productType],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: number, paymentTokenAddress: string) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    
    const hash = await writeContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'purchaseProduct',
      args: [BigInt(productId), paymentTokenAddress as `0x${string}`],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  }

  /**
   * Send a tip to a creator
   */
  async sendTip(
    creatorAddress: string, 
    amount: number,
    paymentTokenAddress: string
  ) {
    const contractAddress = this.getContractAddress('POLYVERSE_STOREFRONT');
    const amountInCents = Math.round(amount * 100);
    
    const hash = await writeContract(config, {
      address: contractAddress as `0x${string}`,
      abi: POLYVERSE_STOREFRONT_ABI,
      functionName: 'sendTip',
      args: [creatorAddress as `0x${string}`, BigInt(amountInCents), paymentTokenAddress as `0x${string}`],
    });

    const receipt = await waitForTransactionReceipt(config, { hash });
    return receipt;
  }

  // UTILITY FUNCTIONS

  /**
   * Get current connected account
   */
  getAccount() {
    return getAccount(config);
  }

  /**
   * Check if user is connected
   */
  isConnected() {
    const account = getAccount(config);
    return account.isConnected;
  }

  /**
   * Get current chain ID
   */
  getChainId() {
    return getChainId(config);
  }

  /**
   * Format token amount for display
   */
  formatTokenAmount(amount: bigint, decimals: number = 6) {
    return formatUnits(amount, decimals);
  }

  /**
   * Parse token amount from string
   */
  parseTokenAmount(amount: string, decimals: number = 6) {
    return parseUnits(amount, decimals);
  }
}

// Export singleton instance
export const contractService = new PolyverseContractService();
export default contractService;