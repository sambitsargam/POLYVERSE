'use client';

import { useUser } from '@/contexts/UserContext';
import { useAccount } from 'wagmi';

export function UserDebugInfo() {
  const { profile, isRegistered, setProfile, clearProfile, forceRestoreProfile } = useUser();
  const { address, isConnected } = useAccount();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</p>
      <p>Registered: {isRegistered ? 'Yes' : 'No'}</p>
      <p>Profile: {profile ? profile.name : 'None'}</p>
      <p>Handle: {profile ? profile.handle : 'None'}</p>
      
      {/* Manual Registration Fix Button */}
      {isConnected && address && !isRegistered && (
        <div className="mt-3 space-y-2">
          <p className="text-yellow-300">Registration Issue Detected!</p>
          <button 
            onClick={() => {
              // Force set registration - for users who already registered but system doesn't recognize
              const manualProfile = {
                handle: prompt('Enter your handle:') || 'creator',
                name: prompt('Enter your name:') || 'Creator',
                bio: '',
                avatar: '',
                coverImage: '',
                isRegistered: true,
                walletAddress: address
              }
              setProfile(manualProfile)
              alert('Profile manually restored! Please refresh the page.')
            }}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs mr-2"
          >
            Manual Fix Registration
          </button>
          <button 
            onClick={forceRestoreProfile}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
          >
            Force Restore Profile
          </button>
        </div>
      )}
      
      {/* Clear Profile Button for Testing */}
      {profile && (
        <button 
          onClick={() => {
            if (confirm('Clear profile? This will require re-registration.')) {
              clearProfile()
              alert('Profile cleared!')
            }
          }}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs mt-2"
        >
          Clear Profile
        </button>
      )}
    </div>
  );
}