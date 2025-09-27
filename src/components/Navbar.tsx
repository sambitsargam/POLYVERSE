'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { MockDataStore } from '@/lib/mockData';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);

  const handleMockModeToggle = () => {
    const newMode = !isMockMode;
    setIsMockMode(newMode);
    MockDataStore.setMockMode(newMode);
    if (newMode) {
      // Reset to mock mode
      MockDataStore.clearAllData();
      window.location.reload();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gradient">POLYVERSE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/raffle" className="text-gray-700 hover:text-primary transition-colors">
              Raffle
            </Link>
            <Link href="/filecoin-demo" className="text-gray-700 hover:text-primary transition-colors">
              Filecoin Demo
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Mock Mode Toggle */}
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={isMockMode}
                onChange={handleMockModeToggle}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-gray-600">Mock Mode</span>
            </label>

            <Link href="/connect" className="btn-secondary">
              <UserIcon className="w-4 h-4 mr-2" />
              Connect Wallet
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              href="/dashboard"
              className="block text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/raffle"
              className="block text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Raffle
            </Link>
            <Link
              href="/filecoin-demo"
              className="block text-gray-700 hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Filecoin Demo
            </Link>
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-2 text-sm mb-4">
                <input
                  type="checkbox"
                  checked={isMockMode}
                  onChange={handleMockModeToggle}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-600">Mock Mode</span>
              </label>
              <Link href="/connect" className="btn-secondary w-full text-center">
                <UserIcon className="w-4 h-4 mr-2" />
                Connect Wallet
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};