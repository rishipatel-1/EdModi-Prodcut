
import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { AppState, UserType } from '../types';
import { Loader2, Rocket, Shield, Zap, ArrowRight, Lock, Mail, AlertCircle, Brain, Users, GraduationCap } from 'lucide-react';
import { ComingSoonOverlay } from './ComingSoonOverlay';

interface AuthPageProps {
  onAuthSuccess: (state: AppState) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [role, setRole] = useState<UserType>(UserType.STUDENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [accessCode, setAccessCode] = useState(''); // For Parent (Student Code) or Teacher (School Code)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (mode === 'signup') {
            if (password !== confirmPass) {
                throw new Error("Passwords do not match");
            }
            if (password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }
            // For demo: Teacher Code = TEACH123
            if (role === UserType.TEACHER && !accessCode) {
                 throw new Error("School Access Code is required for teachers.");
            }
            const state = await AuthService.signup(email, password, role, accessCode);
            onAuthSuccess(state);
        } else {
            const state = await AuthService.login(email, password);
            if (state) {
                onAuthSuccess(state);
            } else {
                throw new Error("Invalid email or password");
            }
        }
    } catch (err: any) {
        setError(err.message || "Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: UserType) => {
    if (selectedRole !== UserType.STUDENT) {
      setShowComingSoon(true);
    } else {
      setRole(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-edmoti-navy flex items-center justify-center p-4 relative overflow-hidden">
      <ComingSoonOverlay isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-edmoti-blue/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-edmoti-mint/5 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl bg-edmoti-navyLight border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-in">
        
        {/* Left: Visual Panel */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-edmoti-blue rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/30">E</div>
                    <span className="text-2xl font-bold text-white tracking-tight">Edmoti</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {mode === 'signup' ? "Unlock Your Potential." : "Resume Your Mission."}
                </h1>
                <p className="text-blue-200 text-lg">
                    {mode === 'signup' 
                        ? "Join thousands of students mastering GCSE Maths with AI-powered personalised learning." 
                        : "Your progress is saved. Let's get back to increasing that mastery score."}
                </p>
            </div>

            <div className="relative z-10 mt-8 space-y-4">
                <div className="flex items-center gap-3 text-blue-100">
                    <div className="p-2 bg-white/10 rounded-lg"><Zap className="w-5 h-5 text-edmoti-gold" /></div>
                    <span>Earn rewards for learning</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                    <div className="p-2 bg-white/10 rounded-lg"><Shield className="w-5 h-5 text-edmoti-mint" /></div>
                    <span>Personalised to your style</span>
                </div>
            </div>
        </div>

        {/* Right: Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-edmoti-navyLight">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {mode === 'signup' ? "Create Account" : "Welcome Back"}
                </h2>
            </div>

            {/* Role Selector */}
            {mode === 'signup' && (
                <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
                    {[
                        { id: UserType.STUDENT, icon: Brain, label: 'Student', disabled: false },
                        { id: UserType.PARENT, icon: Users, label: 'Parent', disabled: true },
                        { id: UserType.TEACHER, icon: GraduationCap, label: 'Teacher', disabled: true },
                    ].map((r) => (
                        <button
                            key={r.id}
                            onClick={() => handleRoleSelect(r.id)}
                            className={`flex-1 flex flex-col items-center py-2 rounded-lg text-xs font-bold transition-all relative ${
                                role === r.id 
                                ? 'bg-edmoti-blue text-white shadow-md' 
                                : r.disabled 
                                    ? 'text-gray-600 cursor-not-allowed opacity-60'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <r.icon className="w-4 h-4 mb-1" />
                            {r.label}
                            {r.disabled && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-edmoti-gold rounded-full" title="Coming Soon" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-2 text-red-200 text-sm animate-shake">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-edmoti-blue focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-edmoti-blue focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {mode === 'signup' && (
                    <>
                        <div className="space-y-1 animate-slide-up">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                                <input 
                                    type="password" 
                                    required
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-edmoti-blue focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Conditional Inputs based on Role */}
                        {role === UserType.PARENT && (
                            <div className="space-y-1 animate-slide-up">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Student Code (Optional)</label>
                                <input 
                                    type="text" 
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Link to child account"
                                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-edmoti-blue focus:outline-none transition-colors"
                                />
                            </div>
                        )}

                         {role === UserType.TEACHER && (
                            <div className="space-y-1 animate-slide-up">
                                <label className="text-xs font-bold text-edmoti-gold uppercase tracking-wider ml-1">School Access Code</label>
                                <input 
                                    type="text" 
                                    required
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Provided by Admin (Use TEACH123)"
                                    className="w-full bg-slate-800 border border-edmoti-gold/50 text-white px-4 py-3 rounded-xl focus:border-edmoti-gold focus:outline-none transition-colors"
                                />
                            </div>
                        )}
                    </>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-edmoti-blue hover:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2 mt-4"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            {mode === 'signup' ? 'Create Account' : 'Log In'} 
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">
                    {mode === 'signup' ? "Already have an account?" : "New to Edmoti?"}
                    <button 
                        onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
                        className="ml-2 text-edmoti-blue font-bold hover:underline"
                    >
                        {mode === 'signup' ? "Log In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
