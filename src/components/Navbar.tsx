
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home, CreditCard, Wallet, Shield } from 'lucide-react';

interface NavbarProps {
  user: any;
  isAdmin: boolean;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar = ({ user, isAdmin, onLogout, activeTab, onTabChange }: NavbarProps) => {
  // Always show basic navigation items, admin item only if user is admin
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'savings', label: 'Savings', icon: Wallet },
    { id: 'loans', label: 'Loans', icon: CreditCard },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">WealthBloom</h1>
              <p className="text-xs text-gray-500">Microfinance Solutions</p>
            </div>
            
            {/* Navigation Items - Always visible */}
            <div className="ml-8 flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      console.log(`Navigating to: ${item.id}`);
                      onTabChange(item.id);
                    }}
                    className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
                      activeTab === item.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-700 hover:text-blue-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.full_name || 'User'}
              </span>
              {isAdmin && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
