
import React, { useState, useRef, useEffect } from 'react';
import { SquadFeedItem, UserType } from '../types';
import { Send, MessageCircle, Zap, Trophy, User, FileText, ClipboardCheck } from 'lucide-react';

interface SquadHubProps {
  feed: SquadFeedItem[];
  currentUserRole: UserType;
  currentUserName: string;
  onPostMessage: (text: string) => void;
}

export const SquadHub: React.FC<SquadHubProps> = ({ feed, currentUserRole, currentUserName, onPostMessage }) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onPostMessage(inputText);
    setInputText('');
  };

  const renderIcon = (type: string) => {
      if (type === 'upload') return <FileText className="w-4 h-4 text-blue-400" />;
      if (type === 'report') return <ClipboardCheck className="w-4 h-4 text-green-400" />;
      return null;
  };

  return (
    <div className="bg-edmoti-navyLight border border-slate-700 rounded-2xl flex flex-col h-[500px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-3">
         <div className="p-2 bg-edmoti-blue/20 rounded-lg">
            <MessageCircle className="w-5 h-5 text-edmoti-blue" />
         </div>
         <div>
             <h3 className="font-bold text-white">Squad Hub</h3>
             <p className="text-xs text-gray-400">Connect with your learning team</p>
         </div>
      </div>

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F1A30]" ref={scrollRef}>
        {feed.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-sm">No activity yet. Start the conversation!</div>
        )}
        
        {feed.map((item) => {
            const isMe = item.senderName === currentUserName;
            const isSystem = item.type === 'system' || item.type === 'reward';
            const isAlert = item.type === 'upload' || item.type === 'report';
            
            if (isSystem) {
                return (
                    <div key={item.id} className="flex justify-center my-2">
                        <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-full text-xs text-gray-400 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-edmoti-gold" />
                            {item.text}
                        </div>
                    </div>
                );
            }

            if (isAlert) {
                 return (
                    <div key={item.id} className="flex justify-center my-2">
                        <div className="bg-slate-800 border border-slate-600 px-4 py-3 rounded-xl text-sm text-gray-200 flex items-start gap-3 max-w-[90%] shadow-lg">
                            <div className="mt-0.5">{renderIcon(item.type)}</div>
                            <div>
                                <div className="font-bold text-xs text-gray-400 uppercase mb-1">{item.senderName}</div>
                                {item.text}
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <div key={item.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 border ${
                        isMe 
                        ? 'bg-blue-900/20 border-blue-800 text-blue-100 rounded-tr-none' 
                        : 'bg-slate-800 border-slate-700 text-gray-200 rounded-tl-none'
                    }`}>
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                            <span className={`text-xs font-bold ${isMe ? 'text-edmoti-blue' : 'text-edmoti-mint'}`}>
                                {item.senderName}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase">
                                {item.senderRole}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">{item.text}</p>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
         <input 
           type="text"
           value={inputText}
           onChange={(e) => setInputText(e.target.value)}
           placeholder="Send a message..."
           className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-sm text-white focus:border-edmoti-blue focus:outline-none transition-colors"
         />
         <button 
           type="submit"
           disabled={!inputText.trim()}
           className="bg-edmoti-blue hover:bg-blue-600 disabled:bg-slate-700 disabled:text-gray-500 text-white p-3 rounded-xl transition-colors shadow-lg"
         >
            <Send className="w-5 h-5" />
         </button>
      </form>
    </div>
  );
};
