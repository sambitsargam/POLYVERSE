import { Synapse } from "@filoz/synapse-sdk";
import { WarmStorageService } from "@filoz/synapse-sdk/warm-storage";
import { formatEther, formatUnits } from "viem";

interface SynapseConfig {
  withCDN: boolean;
  storageCapacity: number; // GB
  persistencePeriod: number; // days
}

export class SynapseService {
  private synapse: Synapse | null = null;
  private warmStorageService: WarmStorageService | null = null;
  private config: SynapseConfig;

  constructor(config: SynapseConfig) {
    this.config = config;
  }

  async initialize(signer: any) {
    try {
      // Create Synapse instance with the signer
      this.synapse = await Synapse.create({
        signer,
        withCDN: this.config.withCDN,
        disableNonceManager: false,
      });

      // Create WarmStorage service
      this.warmStorageService = await WarmStorageService.create(
        this.synapse.getProvider(),
        this.synapse.getWarmStorageAddress()
      );

      return { success: true };
    } catch (error) {
      console.error("Failed to initialize Synapse:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async uploadFile(file: File, address: string, onProgress?: (progress: number) => void, onStatus?: (status: string) => void) {
    if (!this.synapse || !this.warmStorageService) {
      throw new Error("Synapse not initialized");
    }

    try {
      onStatus?.("🔄 Converting file to bytes...");
      onProgress?.(5);
      
      // Convert file to bytes
      const arrayBuffer = await file.arrayBuffer();
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      onStatus?.("💰 Checking storage allowances...");
      onProgress?.(10);

      // Check if we need to create a dataset
      const datasets = await this.synapse.storage.findDataSets(address);
      const datasetExists = datasets.length > 0;

      onStatus?.("🔗 Setting up storage service...");
      onProgress?.(20);

      // Create storage service
      const storageService = await this.synapse.createStorage({
        callbacks: {
          onDataSetResolved: (info: any) => {
            onStatus?.("🔗 Dataset resolved");
            onProgress?.(30);
          },
          onDataSetCreationStarted: (transactionResponse: any) => {
            onStatus?.("🏗️ Creating dataset on blockchain...");
            onProgress?.(40);
          },
          onDataSetCreationProgress: (status: any) => {
            if (status.transactionSuccess) {
              onStatus?.("⛓️ Dataset transaction confirmed");
              onProgress?.(50);
            }
          },
          onProviderSelected: (provider: any) => {
            onStatus?.("🏪 Storage provider selected");
            onProgress?.(55);
          },
        },
      });

      onStatus?.("📁 Uploading file to storage provider...");
      onProgress?.(60);

      // Upload file
      const { pieceCid } = await storageService.upload(uint8ArrayBytes, {
        onUploadComplete: (piece: any) => {
          onStatus?.("📊 File uploaded! Adding to dataset...");
          onProgress?.(80);
        },
        onPieceAdded: (transactionResponse: any) => {
          onStatus?.("🔄 Confirming transaction...");
          onProgress?.(90);
        },
        onPieceConfirmed: (pieceIds: any) => {
          onStatus?.("🌳 File added to dataset successfully");
          onProgress?.(95);
        },
      });

      onStatus?.("🎉 File successfully stored on Filecoin!");
      onProgress?.(100);

      return {
        success: true,
        data: {
          fileName: file.name,
          fileSize: file.size,
          pieceCid: pieceCid.toV1().toString(),
        }
      };

    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  }

  async getBalances(address: string) {
    if (!this.synapse) {
      throw new Error("Synapse not initialized");
    }

    try {
      // Get wallet balances
      const [filBalance, usdfcBalance] = await Promise.all([
        this.synapse.payments.walletBalance(),
        this.synapse.payments.walletBalance("USDFC"),
      ]);

      return {
        filBalance,
        usdfcBalance,
        filBalanceFormatted: Number(formatEther(filBalance)),
        usdfcBalanceFormatted: Number(formatUnits(usdfcBalance, 18)),
      };
    } catch (error) {
      console.error("Failed to get balances:", error);
      throw error;
    }
  }

  async getDatasets(address: string) {
    if (!this.synapse || !this.warmStorageService) {
      throw new Error("Synapse not initialized");
    }

    try {
      // Get user datasets
      const datasets = await this.warmStorageService.getClientDataSetsWithDetails(address);
      
      return datasets.map((dataset: any) => ({
        id: dataset.id || dataset.railId || dataset.datasetId,
        pieces: dataset.details?.pieces || dataset.pieces || [],
        status: dataset.status || dataset.details?.status || "unknown",
        provider: dataset.providerId || dataset.provider,
      }));
    } catch (error) {
      console.error("Failed to get datasets:", error);
      throw error;
    }
  }

  async downloadFile(pieceCid: string, filename: string) {
    if (!this.synapse) {
      throw new Error("Synapse not initialized");
    }

    try {
      const uint8ArrayBytes = await this.synapse.storage.download(pieceCid);
      
      // Create and download file
      const file = new File([uint8ArrayBytes as BlobPart], filename);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Download failed:", error);
      throw error;
    }
  }

  getSynapse() {
    return this.synapse;
  }

  getWarmStorageService() {
    return this.warmStorageService;
  }
}

// Default configuration for Filecoin bounty requirements
export const defaultSynapseConfig: SynapseConfig = {
  withCDN: true, // Fast retrieval for demo
  storageCapacity: 10, // 10GB
  persistencePeriod: 30, // 30 days
};