
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

interface NavigationButtonsProps {
  onHome: () => void;
  onBack: () => void;
  showBack?: boolean;
}

const NavigationButtons = ({ onHome, onBack, showBack = true }: NavigationButtonsProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Button
        onClick={onHome}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Button>
      {showBack && (
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
