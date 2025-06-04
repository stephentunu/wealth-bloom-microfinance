
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

interface NavigationButtonsProps {
  onTabChange?: (tab: string) => void;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonAction?: () => void;
  className?: string;
}

const NavigationButtons = ({ 
  onTabChange, 
  showBackButton = true, 
  backButtonLabel = "Back",
  backButtonAction,
  className = "" 
}: NavigationButtonsProps) => {
  const handleBack = () => {
    if (backButtonAction) {
      backButtonAction();
    } else if (onTabChange) {
      onTabChange('dashboard');
    }
  };

  const handleHome = () => {
    if (onTabChange) {
      onTabChange('dashboard');
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backButtonLabel}</span>
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleHome}
        className="flex items-center space-x-2"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Button>
    </div>
  );
};

export default NavigationButtons;
