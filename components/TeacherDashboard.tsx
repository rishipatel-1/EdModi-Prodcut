
import React, { useState } from 'react';
import { TeacherProfile, UserType, SquadFeedItem } from '../types';
import { AuthService } from '../services/authService';
import { SquadHub } from './SquadHub';
import { Users, TrendingUp, AlertCircle, Trophy, CheckCircle, FileUp, PlusCircle } from 'lucide-react';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  feed: SquadFeedItem[];
  onPostMessage: (text: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, feed, onPostMessage }) => {
  const classroom = AuthService.getClassroomData(); // Mock Data
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [examGrade, setExamGrade] = useState('');
  const [examComment, setExamComment] = useState('');

  // Analytics
  const totalXP = classroom.reduce((acc, s) => acc + s.xp, 0);
  const commonWeakness = 'Algebra'; // Mock calculation

  const handleUploadPaper = () => {
      // Simulating file upload
      onPostMessage(`📄 New Past Paper Uploaded: "Algebra Mock B (Higher)". Due next Monday.`);
      alert("File uploaded to student resources!");
  };

  const handleLogResult = () => {
      if (!selectedStudent || !examGrade) return;
      const studentName = classroom.find(s => s.id === selectedStudent)?.name;
      
      // Logic to add report to feed
      onPostMessage(`📊 Exam Result for ${studentName}: Grade ${examGrade}. ${examComment}`);
      setExamGrade('');
      setExamComment('');
      setSelectedStudent(null);
      alert("Result logged and parents notified.");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-24">
       {/* Header */}
       <header className="flex flex-col md:flex-row justify-between items-end gap-6 bg-edmoti-navyLight p-6 rounded-2xl border border-slate-700">
          <div>
             <h1 className="text-3xl font-bold text-white">Mission Control: {teacher.className}</h1>
             <p className="text-gray-400">{teacher.schoolName}</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Class XP</div>
                <div className="text-2xl font-bold text-edmoti-gold">{totalXP.toLocaleString()}</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider">Students</div>
                <div className="text-2xl font-bold text-white">{classroom.length}</div>
             </div>
          </div>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Classroom Grid & Academic Centre */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* ACADEMIC CENTRE */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Uploads */}
                <div className="bg-blue-900/10 border border-blue-800/30 p-6 rounded-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-edmoti-blue" /> Upload Resources
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">Share past papers or worksheets with the class.</p>
                    <button 
                        onClick={handleUploadPaper}
                        className="w-full bg-edmoti-navyLight border border-dashed border-slate-600 hover:border-edmoti-blue text-gray-300 py-4 rounded-xl transition-colors flex flex-col items-center gap-2"
                    >
                        <FileUp className="w-6 h-6" />
                        <span>Click to Upload PDF</span>
                    </button>
                </div>

                {/* Results Log */}
                <div className="bg-green-900/10 border border-green-800/30 p-6 rounded-xl">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-edmoti-mint" /> Log Exam Result
                    </h3>
                    <div className="space-y-3">
                        <select 
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-sm"
                            value={selectedStudent || ''}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                        >
                            <option value="">Select Student...</option>
                            {classroom.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Grade (1-9)" 
                                className="w-20 bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-sm"
                                value={examGrade}
                                onChange={(e) => setExamGrade(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="Comment (e.g. 'Excellent work')" 
                                className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg p-2 text-sm"
                                value={examComment}
                                onChange={(e) => setExamComment(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleLogResult}
                            disabled={!selectedStudent || !examGrade}
                            className="w-full bg-edmoti-mint hover:bg-green-400 disabled:bg-slate-800 disabled:text-gray-500 text-slate-900 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                            Post Result
                        </button>
                    </div>
                </div>
             </div>

             <h2 className="text-xl font-bold text-white flex items-center gap-2 pt-4">
                <Users className="w-5 h-5 text-edmoti-blue" /> Active Agents
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classroom.map(student => (
                    <div key={student.id} className="bg-edmoti-navyLight border border-slate-700 p-5 rounded-xl hover:border-edmoti-blue transition-colors">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-white">{student.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${student.status === 'Online' ? 'bg-green-500' : 'bg-gray-600'}`} />
                                    <span className="text-xs text-gray-400">{student.status}</span>
                                </div>
                            </div>
                            <div className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-edmoti-gold">
                                Lv {Math.floor(student.xp / 500) + 1}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>XP Today</span>
                                <span className="text-white">+{(Math.random() * 100).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Last Grade</span>
                                <span className="text-white font-bold">{student.lastGrade || '-'}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-800 mt-2">
                                <div className="text-xs text-edmoti-coral font-bold flex items-center gap-1">
                                   <AlertCircle className="w-3 h-3" /> Weak Area: {student.weakAreas[0]}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>

             {/* Bulk Actions */}
             <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                <h3 className="text-white font-bold mb-4">Communication Console</h3>
                <div className="flex gap-3">
                    <button 
                        onClick={() => onPostMessage(`Great work on ${commonWeakness} today everyone! Keep pushing!`)}
                        className="bg-edmoti-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                        Send "Kudos" to All
                    </button>
                    <button className="bg-edmoti-navyLight border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">
                        Assign Homework: {commonWeakness}
                    </button>
                </div>
             </div>
          </div>

          {/* RIGHT: Squad Feed */}
          <div className="lg:col-span-1">
              <SquadHub 
                feed={feed} 
                currentUserRole={UserType.TEACHER} 
                currentUserName={teacher.name}
                onPostMessage={onPostMessage}
              />
          </div>
       </div>
    </div>
  );
};
