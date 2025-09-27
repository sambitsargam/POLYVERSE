'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useWalletPersistence } from '@/hooks/useWalletPersistence'

interface UserProfile {
  handle: string
  name: string
  bio?: string
  avatar?: string
  coverImage?: string
  isRegistered: boolean
  walletAddress: string
}

interface UserContextType {
  profile: UserProfile | null
  isRegistered: boolean
  setProfile: (profile: UserProfile | null) => void
  checkRegistration: () => Promise<void>
  clearProfile: () => void
  forceRestoreProfile: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Enable wallet persistence across tab changes
  useWalletPersistence()

  // Load user profile from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('polyverse_user_profile')
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          setProfileState(parsed)
        } catch (error) {
          console.error('Error parsing saved profile:', error)
          localStorage.removeItem('polyverse_user_profile')
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && profile) {
      localStorage.setItem('polyverse_user_profile', JSON.stringify(profile))
    }
  }, [profile])

  // Handle wallet connection changes more carefully
  useEffect(() => {
    // Only process if we have a stable connection and address
    if (!address || !isConnected) {
      console.log('🔌 Wallet disconnected or no address')
      return
    }

    console.log('🔌 Wallet connected:', address)

    // Check if we have a saved profile for this address
    const savedProfile = localStorage.getItem('polyverse_user_profile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        console.log('💾 Found saved profile:', parsed)
        
        // Use case-insensitive address comparison and more lenient matching
        const addressMatch = parsed.walletAddress?.toLowerCase() === address.toLowerCase()
        
        if (addressMatch && parsed.isRegistered) {
          console.log('✅ Profile matches current address - restoring')
          setProfileState(parsed)
        } else {
          console.log('❌ Profile mismatch:', { 
            addressMatch, 
            savedAddr: parsed.walletAddress, 
            currentAddr: address,
            isRegistered: parsed.isRegistered 
          })
        }
      } catch (error) {
        console.error('Error parsing saved profile:', error)
        localStorage.removeItem('polyverse_user_profile')
      }
    } else {
      console.log('💾 No saved profile found')
    }
    
    // Don't auto-clear profile on connection changes - let user manually clear if needed
  }, [isConnected, address])

  // Auto-check registration when wallet connects, but with debounce
  useEffect(() => {
    if (!isConnected || !address || isLoading) return

    // Debounce the registration check to avoid rapid calls during tab switches
    const timeoutId = setTimeout(() => {
      console.log('🔍 Auto-checking registration after delay')
      checkRegistration()
    }, 1000) // 1 second delay

    return () => clearTimeout(timeoutId)
  }, [isConnected, address, isLoading])

  const setProfile = (newProfile: UserProfile | null) => {
    setProfileState(newProfile)
    if (typeof window !== 'undefined') {
      if (newProfile) {
        localStorage.setItem('polyverse_user_profile', JSON.stringify(newProfile))
      } else {
        localStorage.removeItem('polyverse_user_profile')
      }
    }
  }

  const checkRegistration = async () => {
    if (!address || !isConnected) return

    try {
      // Check localStorage for existing registration
      const savedProfile = localStorage.getItem('polyverse_user_profile')
      console.log('🔍 Debug - Checking registration:')
      console.log('  Current address:', address)
      console.log('  Saved profile:', savedProfile ? JSON.parse(savedProfile) : 'None')
      
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        const addressMatch = parsed.walletAddress?.toLowerCase() === address.toLowerCase()
        console.log('  Address match:', addressMatch)
        console.log('  Is registered:', parsed.isRegistered)
        
        // Always restore profile if addresses match and registration flag is true
        if (addressMatch && parsed.isRegistered) {
          console.log('  ✅ Profile found and valid - setting profile')
          setProfileState(parsed)
          return
        } else {
          console.log('  ❌ Profile mismatch - address or registration issue')
        }
      }
      
      // Only clear profile if we're absolutely sure there's no registration
      console.log('  🔄 No valid profile found - checking current state')
      if (!profile || profile.walletAddress?.toLowerCase() !== address.toLowerCase()) {
        console.log('  🧹 Clearing profile due to address mismatch')
        setProfileState(null)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
    }
  }

  // Add a manual restore function for emergency recovery
  const forceRestoreProfile = () => {
    if (!address) {
      alert('No wallet connected!')
      return
    }

    const savedProfile = localStorage.getItem('polyverse_user_profile')
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile)
        // Force restore regardless of address match
        const restoredProfile = {
          ...parsed,
          walletAddress: address, // Update to current address
          isRegistered: true
        }
        setProfileState(restoredProfile)
        localStorage.setItem('polyverse_user_profile', JSON.stringify(restoredProfile))
        console.log('🔧 Force restored profile:', restoredProfile)
        alert('Profile restored successfully!')
      } catch (error) {
        console.error('Error force restoring profile:', error)
        alert('Error restoring profile')
      }
    } else {
      alert('No saved profile found to restore')
    }
  }

  const clearProfile = () => {
    setProfileState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('polyverse_user_profile')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <UserContext.Provider
      value={{
        profile,
        isRegistered: !!profile?.isRegistered,
        setProfile,
        checkRegistration,
        clearProfile,
        forceRestoreProfile
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}