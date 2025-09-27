# Filecoin Lighthouse Storage Integration

POLYVERSE uses Filecoin's decentralized storage network via the Lighthouse SDK to provide censorship-resistant, encrypted content hosting for creators.

## Overview

Lighthouse is a perpetual file storage protocol that enables developers to store data on Filecoin and IPFS networks with built-in encryption and access control features.

### Key Benefits
- **Decentralized**: Content stored across multiple Filecoin miners
- **Persistent**: Permanent storage with automatic deal renewal
- **Encrypted**: Client-side encryption for premium content
- **Fast Access**: IPFS gateway for quick content delivery
- **Token-Gated**: Access control via smart contracts and NFTs

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   POLYVERSE     │───▶│   Lighthouse     │───▶│   Filecoin      │
│   Frontend      │    │   Gateway        │    │   Network       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Wallet   │    │   IPFS Gateway   │    │   Storage       │
│   Authentication│    │   Global CDN     │    │   Miners        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Implementation

### 1. Upload Configuration

```typescript
// src/lib/lighthouse-storage.ts
import lighthouse from '@lighthouse-web3/sdk';

class LighthouseStorage {
  private apiKey: string;
  private gatewayUrl: string;

  constructor() {
    this.apiKey = process.env.LIGHTHOUSE_API_KEY!;
    this.gatewayUrl = process.env.LIGHTHOUSE_GATEWAY_URL || 
                     'https://gateway.lighthouse.storage/ipfs/';
  }

  // Upload public content
  async uploadFile(file: File): Promise<LighthouseUploadResponse> {
    try {
      const uploadResponse = await lighthouse.upload(
        file,
        this.apiKey
      );

      return {
        success: true,
        hash: uploadResponse.data.Hash,
        url: `${this.gatewayUrl}${uploadResponse.data.Hash}`,
        size: uploadResponse.data.Size,
        name: uploadResponse.data.Name
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  // Upload encrypted content
  async uploadEncrypted(
    file: File, 
    publicKey: string, 
    signedMessage: string
  ): Promise<LighthouseUploadResponse> {
    try {
      const uploadResponse = await lighthouse.uploadEncrypted(
        file,
        this.apiKey,
        publicKey,
        signedMessage
      );

      return {
        success: true,
        hash: uploadResponse.data.Hash,
        url: `${this.gatewayUrl}${uploadResponse.data.Hash}`,
        size: uploadResponse.data.Size,
        name: uploadResponse.data.Name,
        encrypted: true
      };
    } catch (error) {
      throw new Error(`Encrypted upload failed: ${error.message}`);
    }
  }
}
```

### 2. Authentication & Encryption

```typescript
// Generate authentication message for encryption
async function generateAuthMessage(publicKey: string): Promise<string> {
  const messageRequested = await lighthouse.getAuthMessage(publicKey);
  return messageRequested.data.message;
}

// Sign message with wallet
async function signAuthMessage(
  message: string, 
  walletClient: any
): Promise<string> {
  const signedMessage = await walletClient.signMessage({
    message
  });
  return signedMessage;
}

// Complete encryption flow
async function setupEncryption(walletClient: any) {
  const publicKey = await walletClient.getAddresses();
  const message = await generateAuthMessage(publicKey[0]);
  const signedMessage = await signAuthMessage(message, walletClient);
  
  return { publicKey: publicKey[0], signedMessage };
}
```

### 3. Access Control

```typescript
// Set access conditions for encrypted content
async function setAccessConditions(
  hash: string,
  conditions: AccessCondition[]
): Promise<void> {
  try {
    await lighthouse.accessControl.applyAccessCondition(
      hash,
      conditions,
      this.apiKey
    );
  } catch (error) {
    throw new Error(`Access control setup failed: ${error.message}`);
  }
}

// Example: NFT-gated access
const nftAccessCondition: AccessCondition = {
  id: 1,
  chain: "polygon",
  method: "balanceOf",
  standardContractType: "ERC721",
  contractAddress: "0x...", // Your NFT contract
  returnValueTest: {
    comparator: ">",
    value: "0"
  },
  parameters: [":userAddress"]
};

// Example: Subscription-based access  
const subscriptionAccessCondition: AccessCondition = {
  id: 1,
  chain: "polygon",
  method: "hasActiveSubscription", 
  standardContractType: "custom",
  contractAddress: "0x...", // Your subscription contract
  returnValueTest: {
    comparator: "==",
    value: "true"
  },
  parameters: [":userAddress", "basic-weekly"]
};
```

## API Routes

### Upload Endpoint

```typescript
// src/app/api/storage/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LighthouseStorage } from '@/lib/lighthouse-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const encrypt = formData.get('encrypt') === 'true';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const storage = new LighthouseStorage();
    
    if (encrypt) {
      const publicKey = formData.get('publicKey') as string;
      const signedMessage = formData.get('signedMessage') as string;
      
      if (!publicKey || !signedMessage) {
        return NextResponse.json(
          { error: 'Public key and signed message required for encryption' },
          { status: 400 }
        );
      }
      
      const result = await storage.uploadEncrypted(
        file, 
        publicKey, 
        signedMessage
      );
      
      return NextResponse.json(result);
    } else {
      const result = await storage.uploadFile(file);
      return NextResponse.json(result);
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### Deal Status Endpoint

```typescript
// src/app/api/storage/deals/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get('hash');
    
    if (!hash) {
      return NextResponse.json(
        { error: 'IPFS hash required' },
        { status: 400 }
      );
    }

    // Get deal information from Lighthouse
    const dealInfo = await lighthouse.dealStatus(hash);
    
    return NextResponse.json({
      hash,
      deals: dealInfo.data.dealInfo,
      status: dealInfo.data.status,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Deal status error:', error);
    return NextResponse.json(
      { error: 'Failed to get deal status' },
      { status: 500 }
    );
  }
}
```

## Frontend Integration

### File Upload Component

```tsx
// src/components/storage/FileUpload.tsx
'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const { data: walletClient } = useWalletClient();

  const handleUpload = async (file: File, encrypt: boolean = false) => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('encrypt', encrypt.toString());
      
      if (encrypt && walletClient) {
        // Setup encryption
        const addresses = await walletClient.getAddresses();
        const publicKey = addresses[0];
        
        const authMessage = await fetch('/api/storage/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey })
        }).then(r => r.json());
        
        const signedMessage = await walletClient.signMessage({
          message: authMessage.message
        });
        
        formData.append('publicKey', publicKey);
        formData.append('signedMessage', signedMessage);
      }
      
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setUploadResult(result);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, true); // Upload with encryption
        }}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading to Filecoin...</p>}
      
      {uploadResult && (
        <div className="upload-result">
          <p>✅ Upload successful!</p>
          <p>IPFS Hash: {uploadResult.hash}</p>
          <p>Gateway URL: <a href={uploadResult.url}>{uploadResult.url}</a></p>
          {uploadResult.encrypted && <p>🔐 Content is encrypted</p>}
        </div>
      )}
    </div>
  );
}
```

### Content Access Component

```tsx
// src/components/storage/ContentAccess.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface ContentAccessProps {
  ipfsHash: string;
  encrypted: boolean;
  accessConditions?: AccessCondition[];
}

export function ContentAccess({ 
  ipfsHash, 
  encrypted, 
  accessConditions 
}: ContentAccessProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentUrl, setContentUrl] = useState('');
  const { address } = useAccount();

  useEffect(() => {
    checkAccess();
  }, [address, ipfsHash]);

  const checkAccess = async () => {
    if (!address || !encrypted) {
      // Public content - always accessible
      setContentUrl(`https://gateway.lighthouse.storage/ipfs/${ipfsHash}`);
      setHasAccess(true);
      setLoading(false);
      return;
    }

    try {
      // Check if user meets access conditions
      const response = await fetch('/api/storage/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash: ipfsHash,
          userAddress: address,
          conditions: accessConditions
        })
      });

      const result = await response.json();
      setHasAccess(result.hasAccess);
      
      if (result.hasAccess) {
        // Get decryption key and generate access URL
        setContentUrl(result.decryptedUrl);
      }
      
    } catch (error) {
      console.error('Access check failed:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>🔍 Checking access permissions...</div>;
  }

  if (!hasAccess) {
    return (
      <div className="access-denied">
        <p>🔒 This content requires a subscription or NFT to access.</p>
        <button>Purchase Access</button>
      </div>
    );
  }

  return (
    <div className="content-access">
      <p>✅ Access granted!</p>
      <a 
        href={contentUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="access-link"
      >
        View Content
      </a>
    </div>
  );
}
```

## Environment Configuration

```bash
# .env.local
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_from_dashboard
LIGHTHOUSE_GATEWAY_URL=https://gateway.lighthouse.storage/ipfs/
NEXT_PUBLIC_LIGHTHOUSE_GATEWAY=https://gateway.lighthouse.storage/ipfs/

# Alternative IPFS gateways (fallback)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## Testing

### Upload Test Script

```bash
#!/bin/bash
# test-lighthouse-upload.sh

echo "Testing Lighthouse Upload..."

# Test public upload
curl -X POST http://localhost:3000/api/storage/upload \
  -F "file=@test-file.txt" \
  -F "encrypt=false"

echo -e "\n---\n"

# Test encrypted upload (requires wallet signature)
curl -X POST http://localhost:3000/api/storage/upload \
  -F "file=@premium-content.pdf" \
  -F "encrypt=true" \
  -F "publicKey=0x123..." \
  -F "signedMessage=0xabc..."
```

### Deal Status Test

```bash
#!/bin/bash
# test-deal-status.sh

IPFS_HASH="QmYour...Hash"

echo "Checking Filecoin deal status..."
curl "http://localhost:3000/api/storage/deals?hash=$IPFS_HASH"
```

## Troubleshooting

### Common Issues

**Problem**: "Invalid API key"
```bash
# Solution: Get API key from Lighthouse dashboard
# Visit: https://lighthouse.storage/dashboard
# Generate new API key and update .env.local
```

**Problem**: "Encryption setup failed"
```typescript
// Solution: Ensure proper message signing
const message = await lighthouse.getAuthMessage(publicKey);
const signedMessage = await walletClient.signMessage({ 
  message: message.data.message 
});
```

**Problem**: "IPFS gateway timeout"
```typescript
// Solution: Use fallback gateways
const gateways = [
  'https://gateway.lighthouse.storage/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cf-ipfs.com/ipfs/'
];

async function accessWithFallback(hash: string) {
  for (const gateway of gateways) {
    try {
      const response = await fetch(`${gateway}${hash}`);
      if (response.ok) return response;
    } catch (error) {
      continue; // Try next gateway
    }
  }
  throw new Error('All gateways failed');
}
```

**Problem**: "Access conditions not working"
```typescript
// Debug access conditions
console.log('Checking conditions:', conditions);
console.log('User address:', userAddress);

// Verify smart contract integration
const contract = new ethers.Contract(contractAddress, abi, provider);
const hasAccess = await contract.hasActiveSubscription(userAddress);
console.log('Contract access result:', hasAccess);
```

### Monitor Network Health

```bash
# Check Lighthouse network status
curl https://api.lighthouse.storage/api/lighthouse/network_size

# Check IPFS gateway health
curl -I https://gateway.lighthouse.storage/ipfs/QmYour...Hash

# Monitor deal status
curl "https://api.lighthouse.storage/api/lighthouse/deals?publicKey=YOUR_PUBLIC_KEY"
```

## Best Practices

### Security
- Always encrypt sensitive content before upload
- Use strong access conditions (smart contract based)
- Implement proper authentication for upload endpoints
- Monitor access patterns for unusual activity

### Performance  
- Use multiple IPFS gateways for redundancy
- Cache frequently accessed content
- Implement progressive loading for large files
- Monitor gateway response times

### User Experience
- Provide upload progress indicators
- Show clear access requirements
- Implement graceful fallbacks for network issues
- Display deal status and network health info

### Cost Management
- Monitor Filecoin storage costs
- Implement file size limits
- Use data deduplication where possible
- Archive old content to optimize storage deals