
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentProfile, MicroLesson, SessionResult, Topic, ChatMessage } from '../types';
import { generateLessonContent, generateTutorResponse } from '../services/geminiService';
import { Loader2, ArrowRight, CheckCircle, XCircle, Trophy, ArrowLeft, Sparkles, Play, Tv, Info, Tag, MessageCircle, Send, X, HelpCircle } from 'lucide-react';

interface MicroLessonPageProps {
  student: StudentProfile;
  topics: Topic[];
  onComplete: (result: SessionResult) => void;
}

export const MicroLessonPage: React.FC<MicroLessonPageProps> = ({ student, topics, onComplete }) => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<MicroLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [showVideo, setShowVideo] = useState(false);

  // Chat / Tutor State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Determine if this is the special "Calibration" mission
  const isCalibration = topicId === 'calibration';

  // Find topic details (Mock a topic if calibration)
  const topic = isCalibration 
    ? { id: 'calibration', title: 'Initial Calibration', category: 'Assessment', mastery: 'Unfamiliar', progress: 0 } as Topic
    : topics.find(t => t.id === topicId);

  useEffect(() => {
    const fetchLesson = async () => {
      if (topic) {
        setLoading(true);
        const data = await generateLessonContent(topic.id, topic.title, student, isCalibration);
        if (data) {
          setLesson(data);
          // Add welcome message to chat
          if (chatMessages.length === 0) {
            setChatMessages([{
              id: 'welcome',
              role: 'ai',
              text: isCalibration 
                ? "Welcome to the Calibration! I'm here to help if you get stuck, but try your best first."
                : "Hey! I'm Edmoti. If you get stuck or need a simpler explanation, just tap 'Need Help' or open this chat!",
              timestamp: Date.now()
            }]);
          }
        }
        setLoading(false);
      }
    };
    fetchLesson();
  }, [topicId, topic, student, isCalibration]); // ChatMessages removed from deps to prevent loop

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  if (!topic) {
      return <div className="p-8 text-white">Topic not found. <button onClick={() => navigate('/')} className="text-edmoti-blue underline">Go Back</button></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-edmoti-navy text-edmoti-white p-4 text-center">
        <div className="relative">
           <Loader2 className="w-16 h-16 animate-spin text-edmoti-blue mb-6" />
           <Sparkles className="w-6 h-6 text-edmoti-mint absolute -top-2 -right-2 animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
            {isCalibration ? "Calibrating your profile..." : "Designing your Mission..."}
        </h3>
        <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 text-sm text-edmoti-mint font-mono">
          {isCalibration ? "Generating Diagnostic Test" : `Analysing content for: ${student.learningStyle}`}
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-edmoti-navy p-4">
        <p className="text-red-400">Failed to load lesson.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-edmoti-blue underline">Return to Base</button>
      </div>
    );
  }

  const step = lesson.steps[stepIndex];
  const progressPercent = ((stepIndex) / lesson.steps.length) * 100;

  // Utility to get Embed URL robustly
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      // Handle standard watch, embed, shorts, and shortened URLs
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[7].length === 11) ? match[7] : null;
      
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) { 
      console.warn("Error parsing video URL", e);
      return null; 
    }
  };

  const handleOptionClick = (index: number) => {
    if (feedbackState !== 'idle') return;
    setSelectedOption(index);
    if (step.correctAnswerIndex !== undefined) {
      if (index === step.correctAnswerIndex) {
        setFeedbackState('correct');
        setCorrectCount(prev => prev + 1);
      } else {
        setFeedbackState('incorrect');
      }
    } else {
       setFeedbackState('correct'); 
    }
  };

  const handleNext = () => {
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex(prev => prev + 1);
      setSelectedOption(null);
      setFeedbackState('idle');
      setShowVideo(false);
    } else {
      const xp = 50 + (correctCount * 10);
      const result: SessionResult = {
        lessonId: lesson.id,
        topicId: lesson.topicId,
        correctCount,
        totalQuestions: lesson.steps.filter(s => s.type === 'practice' || s.type === 'diagnostic').length,
        xpEarned: xp,
        newMasteryPercent: Math.min(100, topic.progress + 10),
        isCalibration
      };
      onComplete(result);
      navigate('/');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg, timestamp: Date.now() }]);
    
    setIsTyping(true);
    // Context construction
    const context = `Step Type: ${step.type}. Prompt/Content: ${step.prompt || step.content}. Feedback State: ${feedbackState}`;
    
    const aiResponse = await generateTutorResponse(student.name, context, userMsg, student.learningStyle);
    
    setIsTyping(false);
    setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', text: aiResponse, timestamp: Date.now() }]);
  };

  const renderStepContent = () => {
    switch (step.type) {
      case 'diagnostic':
      case 'practice':
        return (
          <div className="space-y-6 animate-fade-in relative">
            {isCalibration && (
                <div className="absolute -top-8 left-0 text-xs uppercase tracking-widest text-edmoti-gold font-mono">
                    Calibration In Progress
                </div>
            )}
            <h2 className="text-2xl font-bold text-white">{step.prompt || "Question"}</h2>
            <div className="space-y-3">
              {step.choices?.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={feedbackState !== 'idle'}
                  className={`w-full p-5 rounded-xl text-left border transition-all duration-200 flex justify-between items-center
                    ${feedbackState === 'idle' 
                        ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-gray-200' 
                        : idx === step.correctAnswerIndex 
                            ? 'bg-green-900/30 border-edmoti-mint text-edmoti-mint'
                            : idx === selectedOption 
                                ? 'bg-red-900/30 border-edmoti-coral text-edmoti-coral'
                                : 'bg-slate-800/50 border-slate-800 text-gray-500'
                    }
                  `}
                >
                  <span className="text-lg">{choice}</span>
                  {feedbackState !== 'idle' && idx === step.correctAnswerIndex && <CheckCircle className="w-6 h-6 text-edmoti-mint" />}
                  {feedbackState !== 'idle' && idx === selectedOption && idx !== step.correctAnswerIndex && <XCircle className="w-6 h-6 text-edmoti-coral" />}
                </button>
              ))}
            </div>
            
            {feedbackState !== 'idle' && (
              <div className={`p-4 rounded-xl ${feedbackState === 'correct' ? 'bg-green-900/20 border border-green-900' : 'bg-red-900/20 border border-red-900'} animate-slide-up`}>
                <p className="text-gray-300 mb-4">{step.explanation || (feedbackState === 'correct' ? 'Great job!' : 'Review the concept and try again.')}</p>
                
                {feedbackState === 'incorrect' && (
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => { setIsChatOpen(true); setChatInput("I don't understand this question, can you explain?"); }}
                            className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-600"
                        >
                            <HelpCircle className="w-4 h-4 text-edmoti-blue" /> I need help
                        </button>
                    </div>
                )}

                <button 
                  onClick={handleNext}
                  className="w-full bg-edmoti-blue hover:bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );

      case 'explanation':
      case 'worked-example':
        const isExplanation = step.type === 'explanation';
        const displayTitle = isExplanation 
            ? (student.contentPreference === 'Example First' ? 'The Recap' : 'The Concept')
            : 'Worked Example';
        const embedUrl = step.videoUrl ? getEmbedUrl(step.videoUrl) : null;

        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              {displayTitle}
              {student.learningStyle === 'Visual' && <span className="text-sm bg-purple-900/50 text-purple-300 px-2 py-1 rounded font-normal border border-purple-700">Visual Mode</span>}
            </h2>
            
            <div className={`bg-edmoti-navyLight p-6 rounded-2xl border shadow-xl ${isExplanation ? 'border-slate-700' : 'border-edmoti-blue/30 bg-blue-900/10'}`}>
              <div className="prose prose-invert max-w-none prose-lg">
                <p className="whitespace-pre-wrap text-gray-300 leading-relaxed font-sans">{step.content}</p>
              </div>
              {/* Inline Help Button */}
              <button 
                onClick={() => { setIsChatOpen(true); setChatInput("Can you explain this part simpler?"); }}
                className="mt-4 text-sm text-edmoti-blue hover:text-blue-300 flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" /> Confused? Ask Edmoti
              </button>
            </div>
            
            {embedUrl && (
               <div className="mt-6">
                  {!showVideo ? (
                      <button 
                        onClick={() => setShowVideo(true)}
                        className="w-full bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-white p-1 rounded-2xl shadow-lg transition-all group"
                      >
                         <div className="flex items-center p-4 gap-4">
                            <div className="w-16 h-16 rounded-xl bg-red-600 flex items-center justify-center shadow-red-900/50 shadow-lg group-hover:scale-105 transition-transform">
                                <Play className="w-8 h-8 fill-white text-white ml-1" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-xs font-bold uppercase text-red-400 bg-red-400/10 px-2 py-0.5 rounded">Video Lesson</span>
                                    {step.videoTags?.map((tag, i) => (
                                       <span key={i} className="text-xs font-bold uppercase text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/50 flex items-center gap-1">
                                          <Tag className="w-3 h-3" /> {tag}
                                       </span>
                                    ))}
                                </div>
                                <h3 className="font-bold text-lg line-clamp-1">{step.videoTitle || "Recommended Watch"}</h3>
                                <p className="text-sm text-gray-400 line-clamp-2 mt-1">{step.videoExplanation}</p>
                            </div>
                         </div>
                      </button>
                  ) : (
                      <div className="space-y-2 animate-fade-in">
                          <div className="rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black shadow-2xl relative">
                             <iframe width="100%" height="100%" src={embedUrl} title="YouTube" frameBorder="0" allowFullScreen></iframe>
                          </div>
                          <div className="flex flex-col gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                              {step.videoExplanation && (
                                  <div className="flex items-start gap-2 text-sm text-gray-300">
                                      <Info className="w-4 h-4 text-edmoti-blue flex-shrink-0 mt-0.5" />
                                      <span>{step.videoExplanation}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}
               </div>
            )}

            <button 
              onClick={handleNext}
              className="w-full bg-edmoti-blue hover:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-6"
            >
              Got it <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 'summary':
        return (
           <div className="text-center space-y-8 py-8 animate-scale-in">
              <div className="inline-block p-6 bg-yellow-500/10 rounded-full mb-4 relative">
                <Trophy className="w-20 h-20 text-edmoti-gold" />
                <Sparkles className="w-8 h-8 text-white absolute top-0 right-0 animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{isCalibration ? "Baseline Established" : "Mission Accomplished!"}</h2>
                <p className="text-gray-400 text-lg">{isCalibration ? "We know where you start. Now let's build." : "You've leveled up!"}</p>
              </div>
              
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 text-left mx-auto max-w-lg">
                <h3 className="text-edmoti-mint text-xs uppercase tracking-wider mb-2 font-bold">Key Takeaway</h3>
                <p className="text-white text-lg italic">"{step.content}"</p>
              </div>
    
              <button 
                onClick={handleNext}
                className="w-full max-w-md mx-auto bg-edmoti-mint hover:bg-green-400 text-slate-900 py-4 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all"
              >
                {isCalibration ? "Go to Dashboard" : "Claim Rewards & Return"}
              </button>
            </div>
        );
        
      default:
        return <div className="text-white">Unknown step type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-edmoti-navy text-white p-4 md:p-8 pb-24 relative overflow-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!isCalibration && (
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Exit Mission
            </button>
          )}
          {isCalibration && <div className="text-edmoti-blue font-bold">INITIAL ASSESSMENT</div>}
          <span className="text-xs font-mono text-edmoti-blue uppercase tracking-widest">{topic.title}</span>
        </div>

        {/* Progress Bar */}
        {step.type !== 'summary' && (
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
            <div 
              className="bg-gradient-to-r from-edmoti-blue to-edmoti-mint h-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>
      </div>

      {/* AI TUTOR FLOATING BUTTON */}
      {step.type !== 'summary' && !isChatOpen && (
        <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-edmoti-blue hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-900/50 transition-all hover:scale-110 z-50 flex items-center gap-2"
        >
            <MessageCircle className="w-6 h-6" />
            <span className="hidden md:inline font-bold">Need Help?</span>
        </button>
      )}

      {/* AI TUTOR CHAT OVERLAY */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-sm h-[500px] bg-edmoti-navyLight border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col animate-slide-up">
            <div className="p-4 bg-slate-800 rounded-t-2xl border-b border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-edmoti-blue rounded-lg flex items-center justify-center font-bold">E</div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Edmoti Tutor</h3>
                        <p className="text-xs text-edmoti-mint">Online & Ready</p>
                    </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0F1A30]">
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                            msg.role === 'user' 
                            ? 'bg-edmoti-blue text-white rounded-br-none' 
                            : 'bg-slate-800 text-gray-200 rounded-bl-none border border-slate-700'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-xl rounded-bl-none border border-slate-700 flex gap-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-slate-800 rounded-b-2xl border-t border-slate-700 flex gap-2">
                <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask for help..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-edmoti-blue focus:outline-none"
                />
                <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="bg-edmoti-blue disabled:bg-slate-700 text-white p-2 rounded-lg"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
