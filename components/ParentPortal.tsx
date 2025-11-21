
import React from 'react';
import { AppState, UserType } from '../types';
import { RewardCard } from './RewardCard';
import { SquadHub } from './SquadHub';
import { CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface ParentPortalProps {
  state: AppState;
  onApproveReward: (id: string) => void;
  onPostMessage: (text: string) => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ state, onApproveReward, onPostMessage }) => {
  const { student, topics, rewards, squadFeed } = state;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24">
      <header className="border-b border-slate-700 pb-6 flex flex-col md:flex-row justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Parent Overview</h1>
            <p className="text-gray-400">Tracking progress for <span className="text-edmoti-blue font-semibold">{student.name}</span></p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COL: Stats & Rewards */}
        <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-edmoti-navyLight p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <Clock className="w-5 h-5" /> Time Learned (Week)
                </div>
                <div className="text-3xl font-bold text-white">3h 45m</div>
                <div className="text-sm text-edmoti-mint mt-1">On track with goal</div>
                </div>
                
                <div className="bg-edmoti-navyLight p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <CheckCircle className="w-5 h-5" /> Micro-Lessons
                </div>
                <div className="text-3xl font-bold text-white">12</div>
                <div className="text-sm text-gray-500 mt-1">Last active: 2 hours ago</div>
                </div>

                <div className="bg-edmoti-navyLight p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-2 text-gray-400">
                    <TrendingUp className="w-5 h-5" /> Current Focus
                </div>
                <div className="text-xl font-bold text-white truncate">{topics[0].title}</div>
                <div className="text-sm text-edmoti-blue mt-1">Level: {topics[0].mastery}</div>
                </div>
            </div>

            {/* Reward Approval Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Reward Requests</h2>
                <p className="text-gray-400 text-sm">Review and approve goals set by {student.name}.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {rewards.map(reward => (
                        <div key={reward.id} className="h-80">
                        <RewardCard 
                            reward={reward} 
                            userCoins={student.coins} 
                            isParentView={true}
                            onApprove={onApproveReward}
                        />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COL: Squad Hub */}
        <div className="lg:col-span-1">
            <SquadHub 
                feed={squadFeed} 
                currentUserRole={UserType.PARENT} 
                currentUserName="Parent"
                onPostMessage={onPostMessage}
            />
            <div className="mt-6 bg-slate-800/50 p-6 rounded-xl border border-dashed border-slate-700 text-center">
                <p className="text-gray-400 italic text-sm">"A short message like 'I saw you working hard!' boosts motivation by 40%."</p>
            </div>
        </div>
      </div>
    </div>
  );
};
