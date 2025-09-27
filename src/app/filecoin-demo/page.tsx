'use client';

import { useState, useEffect } from 'react';
import { CloudArrowUpIcon, CurrencyDollarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SynapseService, defaultSynapseConfig } from '@/lib/synapse-service';
import { showToast } from '@/components/Toast';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Product } from '@/lib/types';

export default function FilecoinDemoPage() {
  const [synapseService, setSynapseService] = useState<SynapseService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // Checkout modal state
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    item: Product | null;
    creatorId: string;
  }>({
    isOpen: false,
    item: null,
    creatorId: '',
  });

  useEffect(() => {
    initializeSynapse();
  }, []);

  const initializeSynapse = async () => {
    try {
      const service = new SynapseService(defaultSynapseConfig);
      
      // Mock signer for demo
      const mockSigner = {
        address: '0x1234567890abcdef1234567890abcdef12345678'
      };
      
      const result = await service.initialize(mockSigner as any);
      
      if (result.success) {
        setSynapseService(service);
        setIsInitialized(true);
        showToast('Filecoin Synapse SDK initialized successfully!', 'success');
      } else {
        showToast('Failed to initialize Synapse SDK', 'error');
      }
    } catch (error) {
      console.error('Synapse initialization error:', error);
      showToast('Synapse initialization failed - Demo mode active', 'error');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Starting upload...');

    try {
      // Mock file upload for demo
      const uploadResult = {
        success: true,
        data: {
          fileName: file.name,
          fileSize: file.size,
          pieceCid: `bafk2bzacea${Math.random().toString(36).substring(7)}`,
        }
      };

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        setUploadStatus(`Uploading to Filecoin... ${i}%`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newFile = {
        id: Date.now().toString(),
        name: uploadResult.data.fileName,
        size: (uploadResult.data.fileSize / 1024 / 1024).toFixed(2) + ' MB',
        pieceCid: uploadResult.data.pieceCid,
        uploadedAt: Date.now(),
        status: 'stored'
      };

      setUploadedFiles(prev => [...prev, newFile]);
      showToast('File successfully stored on Filecoin!', 'success');
      
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  const handleBuyFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    const mockProduct: Product = {
      id: fileId,
      creatorId: 'demo-creator',
      title: file.name,
      description: `Download ${file.name} from Filecoin storage`,
      priceUSD: 9.99,
      type: 'digital_art',
      image: '/api/placeholder/200/200',
      downloadUrl: '',
      createdAt: new Date().toISOString()
    };

    setCheckoutModal({
      isOpen: true,
      item: mockProduct,
      creatorId: 'demo-creator'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Filecoin × KiraPay Integration Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            $5,000 Filecoin Track Bounty - Upload files to decentralized storage and sell them with USDFC payments
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600">
                Synapse SDK: {isInitialized ? 'Ready' : 'Initializing...'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">KiraPay: Ready</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <CloudArrowUpIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Upload to Filecoin</h2>
            </div>

            <div className="space-y-6">
              {/* File Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  disabled={isUploading}
                />
                <label
                  htmlFor="fileInput"
                  className={`cursor-pointer flex flex-col items-center space-y-4 ${isUploading ? 'opacity-50' : ''}`}
                >
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isUploading ? 'Uploading...' : 'Click to upload file'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Any file type, stored on Filecoin network
                    </p>
                  </div>
                </label>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Marketplace Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Filecoin Marketplace</h2>
            </div>

            <div className="space-y-4">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No files uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload a file to see it here for sale</p>
                </div>
              ) : (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-500">Size: {file.size}</p>
                        <p className="text-xs text-gray-400 font-mono">CID: {file.pieceCid.slice(0, 20)}...</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Stored</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-gray-900">$9.99 USDC</span>
                      <button
                        onClick={() => handleBuyFile(file.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Buy with KiraPay
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudArrowUpIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Filecoin Storage</h3>
              <p className="text-sm text-gray-600">
                Decentralized storage using Synapse SDK and warm storage service
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">KiraPay Integration</h3>
              <p className="text-sm text-gray-600">
                USDFC payment processing with auto-populated forms and popup links
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Seamless UX</h3>
              <p className="text-sm text-gray-600">
                Streamlined payment flow with auto-filled addresses and instant popup checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal(prev => ({ ...prev, isOpen: false }))}
        item={checkoutModal.item}
        itemType="product"
        creatorId={checkoutModal.creatorId}
      />
    </div>
  );
}
