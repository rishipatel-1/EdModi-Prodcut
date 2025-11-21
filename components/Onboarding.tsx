
import React, { useState } from 'react';
import { StudentProfile, LearningStyle, ContentPreference } from '../types';
import { ArrowRight, User, Target, Eye, BookOpen, Zap, Check, Sparkles, Brain, Trophy, Sword } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: Partial<StudentProfile>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    name: '',
    learningStyle: undefined,
    contentPreference: undefined,
    targetGrade: '',
    confidenceLevel: undefined,
    weakAreas: []
  });

  const updateField = (field: keyof StudentProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleWeakArea = (area: string) => {
    setFormData(prev => {
      const current = prev.weakAreas || [];
      return {
        ...prev,
        weakAreas: current.includes(area) 
          ? current.filter(a => a !== area)
          : [...current, area]
      };
    });
  };

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    onComplete(formData);
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex p-4 bg-edmoti-blue/10 rounded-full mb-2">
              <Sparkles className="w-12 h-12 text-edmoti-blue" />
            </div>
            <h1 className="text-4xl font-bold text-white">Welcome to Edmoti</h1>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
              Your personal journey to GCSE Maths mastery starts here. Be the hero of your own story.
            </p>
            <div className="pt-8">
              <button 
                onClick={handleNext}
                className="bg-edmoti-blue hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 mx-auto"
              >
                Start Adventure <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case 1: // Name
        return (
          <div className="space-y-6 animate-slide-up max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Character Setup</h2>
            <p className="text-gray-400 text-center">What should we call you?</p>
            
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-500 w-6 h-6" />
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Your Name"
                className="w-full bg-edmoti-navyLight border border-slate-700 text-white text-xl pl-12 pr-4 py-4 rounded-xl focus:border-edmoti-blue focus:outline-none placeholder-gray-600 transition-colors"
                autoFocus
              />
            </div>

            <button 
              onClick={handleNext}
              disabled={!formData.name}
              className="w-full bg-edmoti-blue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-gray-500 text-white py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 2: // Target
        return (
          <div className="space-y-6 animate-slide-up max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">The Mission</h2>
            <p className="text-gray-400 text-center">What is your ultimate objective?</p>
            
            <div className="grid grid-cols-1 gap-3">
              {['Pass (4-5)', 'Strong Pass (6-7)', 'Top Grades (8-9)'].map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    updateField('targetGrade', grade);
                    setTimeout(handleNext, 300);
                  }}
                  className={`p-5 rounded-xl border text-left flex justify-between items-center transition-all ${
                    formData.targetGrade === grade 
                      ? 'bg-edmoti-blue border-edmoti-blue text-white' 
                      : 'bg-edmoti-navyLight border-slate-700 text-gray-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-lg font-medium">{grade}</span>
                  {formData.targetGrade === grade && <Check className="w-5 h-5" />}
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Weak Areas (New Step)
        return (
          <div className="space-y-6 animate-slide-up max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">Choose Your Battles</h2>
              <p className="text-gray-400 mt-2">Which topics do you want to conquer?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {['Algebra', 'Geometry', 'Number', 'Ratio & Proportion', 'Statistics', 'Probability'].map((area) => {
                const isSelected = formData.weakAreas?.includes(area);
                return (
                  <button
                    key={area}
                    onClick={() => toggleWeakArea(area)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-edmoti-blue border-edmoti-blue text-white shadow-lg'
                        : 'bg-edmoti-navyLight border-slate-700 text-gray-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="font-medium">{area}</span>
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={handleNext}
              className="w-full bg-white text-edmoti-navy hover:bg-gray-200 py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 mt-4"
            >
              Confirm Selection <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 4: // Learning Style
        return (
          <div className="space-y-6 animate-slide-up max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Your Superpower</h2>
            <p className="text-gray-400 text-center">How do you best absorb new information?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: LearningStyle.VISUAL, icon: Eye, label: 'Visual', desc: 'Diagrams & Videos' },
                { id: LearningStyle.VERBAL, icon: BookOpen, label: 'Verbal', desc: 'Reading & Lists' },
                { id: LearningStyle.HANDS_ON, icon: Zap, label: 'Hands-on', desc: 'Doing & Solving' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    updateField('learningStyle', style.id);
                    setTimeout(handleNext, 300);
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all h-40 justify-center gap-3 ${
                    formData.learningStyle === style.id 
                      ? 'bg-edmoti-blue border-edmoti-blue text-white shadow-lg shadow-blue-900/50' 
                      : 'bg-edmoti-navyLight border-slate-700 text-gray-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <style.icon className={`w-8 h-8 ${formData.learningStyle === style.id ? 'text-white' : 'text-edmoti-mint'}`} />
                  <div>
                    <div className="font-bold">{style.label}</div>
                    <div className="text-xs opacity-70 mt-1">{style.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Content Preference
        return (
          <div className="space-y-6 animate-slide-up max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white text-center">Combat Style</h2>
            <p className="text-gray-400 text-center">How do you prefer to tackle a new challenge?</p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                    updateField('contentPreference', ContentPreference.EXAMPLE_FIRST);
                    setTimeout(handleNext, 300);
                }}
                className={`w-full p-6 rounded-xl border text-left transition-all group ${
                    formData.contentPreference === ContentPreference.EXAMPLE_FIRST
                    ? 'bg-edmoti-blue border-edmoti-blue text-white'
                    : 'bg-edmoti-navyLight border-slate-700 text-gray-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                    <Target className={`w-6 h-6 ${formData.contentPreference === ContentPreference.EXAMPLE_FIRST ? 'text-white' : 'text-edmoti-mint'}`} />
                    <span className="font-bold text-lg">Examples First</span>
                </div>
                <p className="text-sm opacity-80 pl-9">Show me the action, then explain the theory.</p>
              </button>

              <button
                onClick={() => {
                    updateField('contentPreference', ContentPreference.EXPLANATION_FIRST);
                    setTimeout(handleNext, 300);
                }}
                className={`w-full p-6 rounded-xl border text-left transition-all group ${
                    formData.contentPreference === ContentPreference.EXPLANATION_FIRST
                    ? 'bg-edmoti-blue border-edmoti-blue text-white'
                    : 'bg-edmoti-navyLight border-slate-700 text-gray-300 hover:border-slate-500'
                }`}
              >
                 <div className="flex items-center gap-3 mb-2">
                    <Brain className={`w-6 h-6 ${formData.contentPreference === ContentPreference.EXPLANATION_FIRST ? 'text-white' : 'text-edmoti-mint'}`} />
                    <span className="font-bold text-lg">Explanation First</span>
                </div>
                <p className="text-sm opacity-80 pl-9">Brief me on the rules, then I'll fight.</p>
              </button>
            </div>
          </div>
        );

        case 6: // Confidence (Last Step)
            return (
              <div className="space-y-8 animate-slide-up max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-white text-center">Confidence Check</h2>
                <p className="text-gray-400 text-center">How prepared do you feel right now?</p>
                
                <div className="space-y-4">
                   {[
                       { val: 'Low', label: 'Not Confident (Yet)', color: 'bg-red-500/10 border-red-500/50 text-red-200' },
                       { val: 'Medium', label: 'It\'s Okay', color: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-200' },
                       { val: 'High', label: 'Ready for Anything', color: 'bg-green-500/10 border-green-500/50 text-green-200' }
                   ].map((conf) => (
                       <button
                        key={conf.val}
                        onClick={() => {
                            updateField('confidenceLevel', conf.val);
                            setTimeout(handleFinish, 500);
                        }}
                        className={`w-full p-4 rounded-xl border font-medium text-lg transition-transform hover:scale-[1.02] ${
                            formData.confidenceLevel === conf.val 
                            ? 'bg-edmoti-blue border-edmoti-blue text-white shadow-lg' 
                            : `${conf.color} hover:opacity-80`
                        }`}
                       >
                           {conf.label}
                       </button>
                   ))}
                </div>
              </div>
            );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-edmoti-navy flex flex-col items-center justify-center p-6">
      {/* Progress Indicators */}
      {step > 0 && (
        <div className="w-full max-w-md mb-12 flex gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                    s <= step ? 'bg-edmoti-blue' : 'bg-slate-800'
                }`} 
            />
          ))}
        </div>
      )}
      
      <div className="w-full max-w-2xl">
        {renderStep()}
      </div>
    </div>
  );
};
