
import React from 'react';
import { StudentProfile } from '../types';
import { Radar, Target, ArrowRight, Map, Shield } from 'lucide-react';

interface AssessmentIntroProps {
  student: StudentProfile;
  onStart: () => void;
  onSkip: () => void;
}

export const AssessmentIntro: React.FC<AssessmentIntroProps> = ({ student, onStart, onSkip }) => {
  return (
    <div className="min-h-screen bg-edmoti-navy flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-edmoti-navyLight border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in">
        
        {/* Background FX */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-edmoti-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
           <div className="inline-flex p-4 bg-edmoti-blue/10 rounded-full mb-4 border border-edmoti-blue/20">
             <Radar className="w-10 h-10 text-edmoti-blue animate-pulse" />
           </div>
           <h1 className="text-3xl font-bold text-white mb-2">Skill Calibration</h1>
           <p className="text-gray-400">
             Welcome, {student.name}. To build your perfect map, Edmoti can scan your current maths level.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <button 
             onClick={onStart}
             className="group relative bg-gradient-to-br from-edmoti-blue to-blue-700 hover:to-blue-600 p-6 rounded-2xl border border-blue-400/30 text-left transition-all hover:scale-[1.02] shadow-lg shadow-blue-900/30"
           >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="mb-3 p-2 bg-white/10 w-fit rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Start Calibration</h3>
              <p className="text-blue-100 text-sm mb-4">
                Take a quick 5-minute diagnostic test to identify your exact strengths and weak spots.
              </p>
              <div className="inline-flex items-center gap-2 text-white font-bold text-sm bg-white/20 px-3 py-1 rounded-lg">
                 Recommended <ArrowRight className="w-4 h-4" />
              </div>
           </button>

           <button 
             onClick={onSkip}
             className="group bg-slate-800 hover:bg-slate-750 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 text-left transition-all"
           >
              <div className="mb-3 p-2 bg-slate-700 w-fit rounded-lg">
                <Map className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Skip for Now</h3>
              <p className="text-gray-400 text-sm mb-4">
                Jump straight into the dashboard. We'll rely on the topics you selected during setup.
              </p>
              <div className="inline-flex items-center gap-2 text-gray-400 group-hover:text-white font-medium text-sm">
                 Explore Dashboard <ArrowRight className="w-4 h-4" />
              </div>
           </button>
        </div>

        <div className="text-center">
           <p className="text-xs text-gray-500 uppercase tracking-widest">
             You can always take the calibration test later
           </p>
        </div>
      </div>
    </div>
  );
};
