
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppState, UserType, SessionResult, StudentProfile, MasteryLevel, SquadFeedItem } from './types';
import { AuthService } from './services/authService';
import { Dashboard } from './components/Dashboard';
import { MicroLessonPage } from './components/MicroLessonPage';
import { ParentPortal } from './components/ParentPortal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { Onboarding } from './components/Onboarding';
import { AuthPage } from './components/AuthPage';
import { AssessmentIntro } from './components/AssessmentIntro';
import { ComingSoonOverlay } from './components/ComingSoonOverlay';
import { Layout, Brain, Users, LogOut, Loader2, GraduationCap } from 'lucide-react';

const Navigation = ({ userType, onShowComingSoon, onLogout }: { userType: UserType, onShowComingSoon: () => void, onLogout: () => void }) => {
  const location = useLocation();
  if (location.pathname.includes('/lesson') || location.pathname.includes('/assessment-intro')) return null;

  return (
    <nav className="sticky top-0 z-50 bg-edmoti-navy/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-edmoti-blue rounded-lg flex items-center justify-center font-bold text-white">E</div>
          <span className="font-bold text-xl tracking-tight text-white">Edmoti</span>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Role Switcher - Soft Hidden */}
            <button 
                onClick={onShowComingSoon}
                className="hidden md:flex items-center gap-2 text-sm bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors border border-slate-700 text-gray-400 cursor-not-allowed opacity-60"
                title="Parent Portal Coming Soon"
            >
                <Users className="w-4 h-4" />
                <span>Parent Portal</span>
            </button>
            
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
            </button>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
        const session = AuthService.getCurrentSession();
        if (session) {
            setAppState(session);
        }
        setLoading(false);
    };
    loadSession();
  }, []);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState(prev => {
        if (!prev) return null;
        const newState = updater(prev);
        AuthService.saveProgress(newState);
        return newState;
    });
  };

  const handleShowComingSoon = () => {
    setShowComingSoon(true);
  };

  const handleLogout = () => {
      AuthService.logout();
      setAppState(null);
  };

  const handleAuthSuccess = (state: AppState) => {
      setAppState(state);
  };

  const handleSessionComplete = (result: SessionResult) => {
    if (!appState) return;

    let systemMessage: SquadFeedItem | null = null;

    if (result.isCalibration) {
        systemMessage = {
            id: `sys-${Date.now()}`,
            type: 'system',
            senderName: 'Edmoti HQ',
            senderRole: 'SYSTEM',
            text: `${appState.student.name} completed the Calibration Mission!`,
            timestamp: Date.now()
        };

        updateState(prev => ({
            ...prev,
            squadFeed: [...prev.squadFeed, systemMessage!],
            student: {
                ...prev.student,
                initialAssessmentComplete: true,
                xp: prev.student.xp + result.xpEarned,
                weakAreas: prev.student.weakAreas || []
            }
        }));
        return;
    }

    // Normal Lesson Complete
    systemMessage = {
        id: `sys-${Date.now()}`,
        type: 'system',
        senderName: 'Edmoti HQ',
        senderRole: 'SYSTEM',
        text: `${appState.student.name} mastered a new topic! +${result.xpEarned} XP`,
        timestamp: Date.now()
    };

    updateState(prev => ({
      ...prev,
      squadFeed: [...prev.squadFeed, systemMessage!],
      student: {
        ...prev.student,
        xp: prev.student.xp + result.xpEarned,
        coins: prev.student.coins + Math.floor(result.xpEarned / 2)
      },
      topics: prev.topics.map(t => 
        t.id === result.topicId 
          ? { ...t, progress: Math.min(100, t.progress + 10), mastery: t.progress + 10 >= 80 ? MasteryLevel.SECURE : t.progress + 10 >= 50 ? MasteryLevel.DEVELOPING : MasteryLevel.EMERGING } 
          : t
      ),
      learningPlan: undefined // Invalidate plan on completion to force regeneration
    }));
  };

  const handleOnboardingComplete = (profileData: Partial<StudentProfile>) => {
    updateState(prev => ({
        ...prev,
        hasOnboarded: true,
        student: {
            ...prev.student,
            ...profileData,
            initialAssessmentComplete: false,
            initialAssessmentSkipped: false,
            weakAreas: profileData.weakAreas || []
        }
    }));
  };

  const handleSkipAssessment = () => {
    updateState(prev => ({
        ...prev,
        student: {
            ...prev.student,
            initialAssessmentComplete: true,
            initialAssessmentSkipped: true
        }
    }));
    window.location.hash = '#/';
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-edmoti-navy flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-edmoti-blue animate-spin" />
          </div>
      );
  }

  if (!appState || !appState.isAuthenticated) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Block Teacher Dashboard Access at Route Level
  if (appState.userType === UserType.TEACHER) {
      return (
         <div className="min-h-screen bg-edmoti-navy flex items-center justify-center">
            <ComingSoonOverlay isOpen={true} onClose={handleLogout} />
         </div>
      );
  }

  if (!appState.hasOnboarded) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <HashRouter>
      <ComingSoonOverlay isOpen={showComingSoon} onClose={() => setShowComingSoon(false)} />
      
      <div className="min-h-screen flex flex-col bg-edmoti-navy text-slate-100 font-sans selection:bg-edmoti-blue selection:text-white">
        <Navigation userType={appState.userType} onShowComingSoon={handleShowComingSoon} onLogout={handleLogout} />

        <main className="flex-1 relative">
           <Routes>
             <Route 
               path="/" 
               element={
                  !appState.student.initialAssessmentComplete && !appState.student.initialAssessmentSkipped
                  ? <Navigate to="/assessment-intro" />
                  : (appState.userType === UserType.STUDENT 
                      ? <Dashboard state={appState} />
                      : <Navigate to="/" /> /* Redirect parents back to root which will handle logic, but ideally parents can't login */)
               } 
             />
             <Route
               path="/assessment-intro"
               element={
                 <AssessmentIntro 
                    student={appState.student}
                    onStart={() => window.location.hash = '#/lesson/calibration'}
                    onSkip={handleSkipAssessment}
                 />
               }
             />
             <Route 
               path="/lesson/:topicId" 
               element={
                 <MicroLessonPage 
                    student={appState.student} 
                    topics={appState.topics}
                    onComplete={handleSessionComplete} 
                 />
               } 
             />
           </Routes>
        </main>
        
        {/* Mobile Nav Placeholder */}
        <div className="fixed bottom-0 left-0 right-0 bg-edmoti-navyLight border-t border-slate-800 p-4 md:hidden flex justify-around text-gray-400 z-30">
            <button className="text-edmoti-blue"><Layout className="w-6 h-6" /></button>
            <button onClick={handleShowComingSoon} className="text-gray-600 opacity-50"><Brain className="w-6 h-6" /></button>
            <button onClick={handleShowComingSoon} className="text-gray-600 opacity-50"><Users className="w-6 h-6" /></button>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
