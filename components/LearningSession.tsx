import React, { useState, useEffect } from 'react';
import { Topic, StudentProfile, MicroLesson, MicroLessonStep } from '../types';
import { generateLessonContent } from '../services/geminiService';
import { ArrowRight, CheckCircle, XCircle, Loader2, Trophy, BookOpen } from 'lucide-react';

interface LearningSessionProps {
  topic: Topic;
  student: StudentProfile;
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({ topic, student, onComplete, onExit }) => {
  const [lesson, setLesson] = useState<MicroLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'diagnostic' | 'content' | 'practice' | 'summary'>('diagnostic');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      const data = await generateLessonContent(topic.id, topic.title, student);
      if (data) {
        setLesson(data);
      }
      setLoading(false);
    };
    fetchLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]); // Only fetch when topic changes

  const diagnosticStep = lesson?.steps.find(s => s.type === 'diagnostic');
  const explanationStep = lesson?.steps.find(s => s.type === 'explanation');
  const workedExampleStep = lesson?.steps.find(s => s.type === 'worked-example');
  const practiceSteps = lesson?.steps.filter(s => s.type === 'practice') || [];
  const summaryStep = lesson?.steps.find(s => s.type === 'summary');

  const handleAnswer = (question: MicroLessonStep, optionIndex: number) => {
    setSelectedOption(optionIndex);
    if (optionIndex === question.correctAnswerIndex) {
      setFeedback('correct');
      setXpEarned(prev => prev + 10);
    } else {
      setFeedback('incorrect');
    }
  };

  const nextStep = () => {
    setSelectedOption(null);
    setFeedback(null);

    if (step === 'diagnostic') {
      setStep('content');
    } else if (step === 'content') {
      setStep('practice');
    } else if (step === 'practice') {
      if (currentQuestionIndex < practiceSteps.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setStep('summary');
        onComplete(xpEarned + 50); // Bonus for completion
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-edmoti-white">
        <Loader2 className="w-12 h-12 animate-spin text-edmoti-mint mb-4" />
        <h3 className="text-xl font-bold">Personalising your lesson...</h3>
        <p className="text-gray-400 mt-2">Aligning to your {student.learningStyle} style</p>
      </div>
    );
  }

  if (!lesson) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-edmoti-white">
            <p>Something went wrong generating content. Please try again.</p>
            <button onClick={onExit} className="mt-4 text-edmoti-blue underline">Go Back</button>
        </div>
    )
  }

  // Render Helper: Quiz Card
  const renderQuizCard = (question: MicroLessonStep) => (
    <div className="bg-edmoti-navyLight p-6 rounded-2xl border border-slate-700 shadow-lg animate-fade-in">
      <h3 className="text-lg font-medium mb-4 text-white">{question.prompt}</h3>
      <div className="space-y-3">
        {question.choices?.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => !feedback && handleAnswer(question, idx)}
            disabled={!!feedback}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center
              ${
                feedback && idx === question.correctAnswerIndex
                  ? 'bg-green-900/30 border-edmoti-mint text-edmoti-mint'
                  : feedback && idx === selectedOption && idx !== question.correctAnswerIndex
                  ? 'bg-red-900/30 border-edmoti-coral text-edmoti-coral'
                  : selectedOption === idx
                  ? 'bg-blue-900/30 border-edmoti-blue'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-gray-300'
              }
            `}
          >
            <span>{opt}</span>
            {feedback && idx === question.correctAnswerIndex && <CheckCircle className="w-5 h-5 text-edmoti-mint" />}
            {feedback && idx === selectedOption && idx !== question.correctAnswerIndex && <XCircle className="w-5 h-5 text-edmoti-coral" />}
          </button>
        ))}
      </div>
      
      {feedback && (
        <div className={`mt-6 p-4 rounded-xl ${feedback === 'correct' ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
          <p className="text-sm font-mono mb-1 uppercase tracking-wider text-gray-400">
            {feedback === 'correct' ? 'Nicely done!' : 'Not quite'}
          </p>
          <p className="text-white">{question.explanation}</p>
          <button 
            onClick={nextStep}
            className="mt-4 w-full bg-edmoti-blue hover:bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {step === 'practice' && currentQuestionIndex < practiceSteps.length - 1 ? 'Next Question' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
        <span className="uppercase tracking-widest font-mono text-edmoti-blue">{topic.title}</span>
        <div className="flex items-center gap-2">
          <span className="bg-edmoti-navyLight px-3 py-1 rounded-full border border-slate-700">
            XP: {xpEarned}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-edmoti-mint h-full transition-all duration-500" 
          style={{ width: step === 'diagnostic' ? '10%' : step === 'content' ? '40%' : step === 'practice' ? `${50 + ((currentQuestionIndex + 1) / practiceSteps.length) * 40}%` : '100%' }}
        ></div>
      </div>

      {/* Step: Diagnostic */}
      {step === 'diagnostic' && diagnosticStep && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Quick Check-in</h2>
          <p className="text-gray-400">Let's see what you already know about this.</p>
          {renderQuizCard(diagnosticStep)}
        </div>
      )}

      {/* Step: Content (Explanation + Example) */}
      {step === 'content' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-edmoti-navyLight border border-edmoti-blue/30 rounded-2xl p-6 shadow-xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BookOpen className="w-24 h-24 text-edmoti-blue" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">The Breakdown</h2>
            <div className="prose prose-invert text-gray-300 mb-6">
              <p>{explanationStep?.content}</p>
            </div>
            
            {workedExampleStep && (
              <div className="bg-slate-900/50 rounded-xl p-5 border-l-4 border-edmoti-mint">
                 <h3 className="text-edmoti-mint font-mono text-sm uppercase tracking-wider mb-2">Worked Example</h3>
                 <div className="prose prose-invert text-white whitespace-pre-wrap font-mono text-sm">
                   {workedExampleStep.content}
                 </div>
              </div>
            )}
          </div>

          <button 
            onClick={nextStep}
            className="w-full bg-edmoti-blue hover:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all"
          >
            Got it, let's practice
          </button>
        </div>
      )}

      {/* Step: Practice */}
      {step === 'practice' && practiceSteps.length > 0 && (
        <div className="space-y-4">
           <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             Practice Mode <span className="text-sm font-normal text-gray-500 bg-slate-800 px-2 py-1 rounded">Q{currentQuestionIndex + 1}/{practiceSteps.length}</span>
           </h2>
           {renderQuizCard(practiceSteps[currentQuestionIndex])}
        </div>
      )}

      {/* Step: Summary */}
      {step === 'summary' && summaryStep && (
        <div className="text-center space-y-8 py-8 animate-scale-in">
          <div className="inline-block p-6 bg-yellow-500/20 rounded-full mb-4">
            <Trophy className="w-16 h-16 text-edmoti-gold" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
            <p className="text-edmoti-mint font-medium">+{xpEarned} XP Earned</p>
          </div>
          
          <div className="bg-edmoti-navyLight p-6 rounded-2xl border border-slate-700 text-left">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Takeaway</h3>
            <p className="text-white text-lg italic">"{summaryStep.content}"</p>
          </div>

          <button 
            onClick={onExit}
            className="w-full bg-edmoti-mint hover:bg-green-400 text-slate-900 py-4 rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};