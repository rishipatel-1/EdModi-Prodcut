
import React from 'react';
import { Construction, X } from 'lucide-react';

interface ComingSoonOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-edmoti-navyLight border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-edmoti-gold/10 rounded-full mb-2">
            <Construction className="w-12 h-12 text-edmoti-gold" />
          </div>
          
          <h2 className="text-2xl font-bold text-white">🚧 Coming Soon</h2>
          
          <p className="text-gray-300 leading-relaxed">
            This feature will be available in a future update. 
            Right now, we’re focused on building the most effective learning experience for students.
          </p>

          <button 
            onClick={onClose}
            className="mt-4 bg-edmoti-blue hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
};
