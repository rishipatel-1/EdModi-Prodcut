
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, Topic, MasteryLevel, LearningPlan } from '../types';
import { generateLearningPlan } from '../services/geminiService';
import { Flame, Zap, Star, Play, ShieldAlert, Swords, Trophy, Target, Map, ChevronRight, Lightbulb, Search, X, Radar, ArrowRight } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const { student, topics } = state;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local state for the plan (will be persisted via props if passed up, but local for now)
  const [plan, setPlan] = useState<LearningPlan | null>(state.learningPlan || null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    if (!plan && !generatingPlan && topics.length > 0) {
      const createPlan = async () => {
        setGeneratingPlan(true);
        const newPlan = await generateLearningPlan(student, topics);
        if (newPlan) setPlan(newPlan);
        setGeneratingPlan(false);
      };
      createPlan();
    }
  }, [plan, generatingPlan, topics, student]);

  // RANK LOGIC
  const xpPerLevel = 500;
  const level = Math.floor(student.xp / xpPerLevel) + 1;
  const currentLevelXp = student.xp % xpPerLevel;
  const progressPercent = (currentLevelXp / xpPerLevel) * 100;
  
  const rankTitles = ["Cadet", "Scout", "Ranger", "Vanguard", "Sentinel", "Champion", "Legend"];
  const currentRank = rankTitles[Math.min(level - 1, rankTitles.length - 1)];

  // SEARCH LOGIC
  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weakAreas = student.weakAreas || [];
  const showCalibrationAlert = student.initialAssessmentSkipped;
  const weakAreaTopics = topics.filter(t => weakAreas.includes(t.category) && t.mastery !== MasteryLevel.SECURE);
  const priorityTopic = weakAreaTopics.length > 0 ? weakAreaTopics[0] : topics.find(t => t.mastery !== MasteryLevel.SECURE) || topics[0];
  const villains = weakAreaTopics.filter(t => t.id !== priorityTopic.id);
  const standardTopics = topics.filter(t => !weakAreas.includes(t.category) && t.id !== priorityTopic.id);

  const handleStartTopic = (topic: Topic) => {
    navigate(`/lesson/${topic.id}`);
  };
  
  const handleStartTopicById = (topicId: string) => {
    navigate(`/lesson/${topicId}`);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-8 pb-24">
      
      {/* SECTION 1: MISSION CONTROL (Header) */}
      <header className="bg-edmoti-navyLight rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-edmoti-blue/5 rounded-full blur-3xl pointer-events-none" />
         
         <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-gradient-to-br from-edmoti-blue to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-900/50 border border-blue-400/30">
                  {level}
               </div>
               <div>
                  <div className="text-edmoti-blue font-mono text-xs uppercase tracking-widest mb-1">Current Rank</div>
                  <h1 className="text-3xl font-bold text-white">{currentRank} {student.name}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                     <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> {student.streak} Day Streak</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-edmoti-gold" /> {student.coins} Coins</span>
                  </div>
               </div>
            </div>

            <div className="w-full md:w-1/3">
               <div className="flex justify-between text-xs mb-2 font-mono">
                  <span className="text-gray-400">XP: {student.xp}</span>
                  <span className="text-edmoti-mint">Next Rank: {level * xpPerLevel} XP</span>
               </div>
               <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                     className="h-full bg-gradient-to-r from-edmoti-blue to-edmoti-mint transition-all duration-1000" 
                     style={{ width: `${progressPercent}%` }}
                  />
               </div>
            </div>
         </div>
      </header>

      {/* CALIBRATION ALERT */}
      {showCalibrationAlert && (
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg"><Radar className="w-5 h-5 text-indigo-400" /></div>
                <div>
                    <h4 className="text-white font-bold text-sm">Calibration Pending</h4>
                    <p className="text-xs text-indigo-200">Take the diagnostic test to get better recommendations.</p>
                </div>
            </div>
            <button 
                onClick={() => navigate('/lesson/calibration')}
                className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg transition-colors"
            >
                Calibrate Now
            </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative z-20">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-12 py-4 bg-edmoti-navyLight border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-edmoti-blue focus:border-transparent shadow-sm transition-all"
          placeholder="Find a mission (e.g. 'Algebra', 'Circle Theorems')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* CONDITIONAL RENDER: SEARCH RESULTS vs DASHBOARD */}
      {searchQuery ? (
        <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-edmoti-mint" /> 
                Found {filteredTopics.length} Missions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map(topic => (
                    <div 
                        key={topic.id}
                        onClick={() => handleStartTopic(topic)}
                        className="bg-edmoti-navyLight border border-slate-700 hover:border-edmoti-blue p-5 rounded-xl cursor-pointer transition-all hover:-translate-y-1 group"
                    >
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-edmoti-blue transition-colors">{topic.title}</h4>
                        <p className="text-xs text-gray-500">{topic.category} • {topic.mastery}</p>
                    </div>
                ))}
            </div>
        </div>
      ) : (
        <>
          {/* SECTION 2: MISSION ROADMAP (AI GENERATED PLAN) */}
          {plan && (
            <section className="animate-slide-up">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                 <Map className="w-5 h-5 text-edmoti-blue" /> Mission Roadmap
              </h2>
              <div className="space-y-4">
                {plan.sequence.map((session, idx) => (
                   <div key={idx} className={`bg-edmoti-navyLight border ${idx === 0 ? 'border-edmoti-blue' : 'border-slate-700'} rounded-xl p-5 relative overflow-hidden`}>
                      {idx === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-edmoti-blue" />}
                      
                      <div className="flex items-center gap-3 mb-3">
                         <div className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${idx === 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-slate-800 text-gray-500'}`}>
                            {idx === 0 ? 'Next Up' : `Session ${session.sessionNumber}`}
                         </div>
                         <div className="text-xs text-gray-400 capitalize flex items-center gap-1">
                            <Target className="w-3 h-3" /> Focus: {session.focus}
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {session.topics.map((t, tIdx) => (
                            <div 
                                key={tIdx} 
                                onClick={() => handleStartTopicById(t.topicId)}
                                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-edmoti-blue cursor-pointer group"
                            >
                                <div>
                                   <div className="font-bold text-white text-sm group-hover:text-edmoti-blue">{t.topicName}</div>
                                   <div className="text-xs text-gray-500">{t.reason}</div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                            </div>
                         ))}
                      </div>
                   </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 text-sm text-gray-400 flex gap-3">
                 <Lightbulb className="w-5 h-5 text-edmoti-gold flex-shrink-0" />
                 <p>{plan.overallStrategy.summary}</p>
              </div>
            </section>
          )}

          {/* LOADING STATE FOR PLAN */}
          {!plan && generatingPlan && (
             <div className="h-32 bg-edmoti-navyLight border border-slate-700 rounded-xl flex items-center justify-center text-gray-400 gap-2">
                <div className="w-5 h-5 border-2 border-edmoti-blue border-t-transparent rounded-full animate-spin" />
                Generating Strategic Plan...
             </div>
          )}

          {/* SECTION 3: PRIORITY MISSION (Hero) */}
          {!plan && (
            <section className="animate-slide-up">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Target className="w-5 h-5 text-edmoti-coral" /> Priority Mission
                </h2>
                <span className="text-xs text-gray-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">Recommended for you</span>
             </div>

             <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-1 border border-edmoti-coral/50 shadow-xl shadow-red-900/10 group cursor-pointer" onClick={() => handleStartTopic(priorityTopic)}>
                <div className="bg-[#0F1A30] rounded-xl p-6 md:p-8 relative overflow-hidden h-full transition-all group-hover:bg-[#131f3a]">
                   <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-edmoti-coral via-transparent to-transparent" />
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div className="space-y-2">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-edmoti-coral text-xs font-bold uppercase tracking-wider border border-red-500/20">
                            <ShieldAlert className="w-3 h-3" /> {priorityTopic.category} Threat
                         </div>
                         <h3 className="text-3xl md:text-4xl font-bold text-white group-hover:text-edmoti-coral transition-colors">
                            {priorityTopic.title}
                         </h3>
                         <p className="text-gray-400 max-w-lg">
                            {weakAreas.includes(priorityTopic.category) 
                               ? "This topic is currently holding back your grade. Complete this mission to turn this weakness into a strength."
                               : "Master this core concept to unlock advanced challenges."}
                         </p>
                      </div>
                      <button className="whitespace-nowrap bg-edmoti-coral hover:bg-red-400 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center gap-2 transition-transform transform group-hover:scale-105">
                         <Play className="w-5 h-5 fill-current" /> Start Mission
                      </button>
                   </div>
                </div>
             </div>
          </section>
          )}

          {/* SECTION 4: MASTERY PROTOCOL */}
          <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <Map className="w-5 h-5 text-edmoti-mint" /> Mastery Protocol
                </h2>
                <span className="text-xs px-2 py-1 bg-green-900/20 text-edmoti-mint rounded border border-green-900/30">
                   {topics.filter(t => t.mastery === MasteryLevel.SECURE).length} Secured
                </span>
             </div>
             <div className="space-y-3">
                {standardTopics.map(topic => (
                   <div 
                      key={topic.id}
                      onClick={() => handleStartTopic(topic)}
                      className="group flex items-center justify-between p-4 bg-edmoti-navyLight border border-slate-700 rounded-xl hover:border-slate-500 cursor-pointer transition-all"
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            topic.mastery === MasteryLevel.SECURE 
                               ? 'bg-edmoti-mint/20 text-edmoti-mint' 
                               : 'bg-slate-800 text-gray-500'
                         }`}>
                            {topic.mastery === MasteryLevel.SECURE ? <Trophy className="w-5 h-5" /> : <div className="w-3 h-3 bg-current rounded-full" />}
                         </div>
                         <div>
                            <h4 className="text-white font-medium group-hover:text-edmoti-blue transition-colors">{topic.title}</h4>
                            <p className="text-xs text-gray-500">{topic.category} • {topic.mastery}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                      </div>
                   </div>
                ))}
             </div>
          </section>
        </>
      )}
    </div>
  );
};
