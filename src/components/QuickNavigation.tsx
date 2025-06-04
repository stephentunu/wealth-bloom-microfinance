
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Wallet, 
  CreditCard, 
  Shield, 
  TrendingUp, 
  Users, 
  Settings,
  ArrowRight
} from 'lucide-react';

interface QuickNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
}

const QuickNavigation = ({ activeTab, onTabChange, isAdmin }: QuickNavigationProps) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Summary',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'savings',
      label: 'Savings',
      icon: Wallet,
      description: 'Manage your savings',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'loans',
      label: 'Loans',
      icon: CreditCard,
      description: 'Apply & manage loans',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600'
    },
  ];

  if (isAdmin) {
    navigationItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      description: 'System administration',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600'
    });
  }

  const quickActions = [
    {
      label: 'View Analytics',
      icon: TrendingUp,
      action: () => onTabChange('dashboard'),
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    ...(isAdmin ? [{
      label: 'Manage Users',
      icon: Users,
      action: () => onTabChange('admin'),
      color: 'bg-purple-600 hover:bg-purple-700'
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Main Navigation Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'ring-2 ring-blue-500 shadow-md' 
                    : 'hover:shadow-md'
                } ${item.color}`}
                onClick={() => onTabChange(item.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon className={`h-6 w-6 ${item.iconColor}`} />
                        <h4 className="text-lg font-medium text-gray-900">
                          {item.label}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  {isActive && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Currently Active
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white`}
                size="sm"
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickNavigation;
