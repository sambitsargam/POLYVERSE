import { Creator, Product, Purchase, MockRates, User } from './types';

export class MockDataStore {
  private static readonly STORAGE_KEYS = {
    PURCHASES: 'polyverse_purchases',
    USER: 'polyverse_user',
    MOCK_MODE: 'polyverse_mock_mode',
  };

  static async getCreators(): Promise<Creator[]> {
    const response = await fetch('/data/creators.json');
    return response.json();
  }

  static async getProducts(): Promise<Product[]> {
    const response = await fetch('/data/products.json');
    return response.json();
  }

  static async getMockRates(): Promise<MockRates> {
    const response = await fetch('/data/mockRates.json');
    return response.json();
  }

  static getPurchases(): Purchase[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEYS.PURCHASES);
    return stored ? JSON.parse(stored) : [];
  }

  static savePurchase(purchase: Purchase): void {
    if (typeof window === 'undefined') return;
    const purchases = this.getPurchases();
    purchases.push(purchase);
    localStorage.setItem(this.STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  }

  static saveUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static isMockMode(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(this.STORAGE_KEYS.MOCK_MODE);
    return stored !== 'false'; // Default to true
  }

  static setMockMode(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEYS.MOCK_MODE, enabled.toString());
  }

  static async simulatePayment(
    userId: string,
    creatorId: string,
    itemId: string,
    itemType: 'subscription' | 'product' | 'tip',
    amountUSD: number,
    token: 'MATIC' | 'ETH' | 'USDC'
  ): Promise<Purchase> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const rates = await this.getMockRates();
    const tokenAmount = this.calculateTokenAmount(amountUSD, token, rates);
    
    const purchase: Purchase = {
      id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      creatorId,
      itemId,
      itemType,
      amountUSD,
      token,
      tokenAmount,
      transactionHash: this.generateMockTransactionHash(),
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    this.savePurchase(purchase);
    return purchase;
  }

  private static calculateTokenAmount(usdAmount: number, token: 'MATIC' | 'ETH' | 'USDC', rates: MockRates): number {
    switch (token) {
      case 'MATIC':
        return usdAmount * rates.USD_TO_MATIC;
      case 'ETH':
        return usdAmount * rates.USD_TO_ETH;
      case 'USDC':
        return usdAmount * rates.USD_TO_USDC;
      default:
        return usdAmount;
    }
  }

  private static generateMockTransactionHash(): string {
    return '0x' + Math.random().toString(16).substr(2, 64);
  }
}