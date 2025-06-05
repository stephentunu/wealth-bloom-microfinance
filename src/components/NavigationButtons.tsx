
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
    <div className="flex items-center gap-3 mb-6 p-2">
      <Button
        onClick={onHome}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Button>
      {showBack && (
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
