'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

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
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount()
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    if (isConnected && address) {
      // Check if we have a saved profile for this address
      const savedProfile = localStorage.getItem('polyverse_user_profile')
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile)
          if (parsed.walletAddress === address && parsed.isRegistered) {
            setProfileState(parsed)
          }
        } catch (error) {
          console.error('Error parsing saved profile:', error)
        }
      }
    }
    // Only clear profile if wallet is explicitly disconnected AND we're sure it's disconnected
    // Don't clear on temporary connection issues
  }, [isConnected, address])

  // Auto-check registration when wallet connects
  useEffect(() => {
    if (isConnected && address && !isLoading) {
      checkRegistration()
    }
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
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        if (parsed.walletAddress === address && parsed.isRegistered) {
          setProfileState(parsed)
          return
        }
      }
      
      // If no valid saved profile found for this address, don't clear existing profile immediately
      // Only set to null if we're sure there's no registration
      if (!profile || profile.walletAddress !== address) {
        setProfileState(null)
      }
    } catch (error) {
      console.error('Error checking registration:', error)
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
        clearProfile
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