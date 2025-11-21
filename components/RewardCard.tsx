import React from 'react';
import { Reward } from '../types';
import { Lock, Check, Clock } from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
  userCoins: number;
  onRedeem?: (id: string) => void;
  isParentView?: boolean;
  onApprove?: (id: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ 
  reward, 
  userCoins, 
  onRedeem, 
  isParentView = false,
  onApprove
}) => {
  const canAfford = userCoins >= reward.cost;
  const isApproved = reward.status === 'Approved';

  return (
    <div className="bg-edmoti-navyLight border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-colors group flex flex-col h-full">
      <div className="h-32 bg-slate-800 relative flex items-center justify-center overflow-hidden">
         <img src={reward.imagePlaceholder} alt={reward.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
         <span className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-edmoti-gold font-bold text-sm flex items-center gap-1">
           <div className="w-3 h-3 rounded-full bg-edmoti-gold" /> {reward.cost} Coins
         </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-white mb-1">{reward.title}</h3>
        <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                reward.status === 'Approved' ? 'border-edmoti-mint text-edmoti-mint' :
                reward.status === 'Redeemed' ? 'border-gray-500 text-gray-500' :
                'border-edmoti-gold text-edmoti-gold'
            }`}>
                {reward.status}
            </span>
        </div>
        
        <div className="mt-auto">
            {isParentView ? (
                reward.status === 'Wishlist' ? (
                    <button 
                        onClick={() => onApprove?.(reward.id)}
                        className="w-full bg-edmoti-blue hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium"
                    >
                        Approve Reward
                    </button>
                ) : (
                    <div className="text-center text-gray-500 text-sm py-2">Approved</div>
                )
            ) : (
                <button 
                    disabled={!canAfford || !isApproved || reward.status === 'Redeemed'}
                    onClick={() => onRedeem?.(reward.id)}
                    className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2
                        ${reward.status === 'Redeemed' 
                            ? 'bg-slate-800 text-gray-500 cursor-not-allowed' 
                            : !isApproved 
                            ? 'bg-slate-800 text-gray-400 cursor-not-allowed'
                            : canAfford 
                            ? 'bg-edmoti-gold text-slate-900 hover:bg-yellow-400' 
                            : 'bg-slate-700 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {reward.status === 'Redeemed' ? (
                        <>Redeemed <Check className="w-4 h-4" /></>
                    ) : !isApproved ? (
                        <>Pending Approval <Clock className="w-4 h-4" /></>
                    ) : canAfford ? (
                        'Redeem Now'
                    ) : (
                        <>Need {reward.cost - userCoins} more coins <Lock className="w-4 h-4" /></>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};