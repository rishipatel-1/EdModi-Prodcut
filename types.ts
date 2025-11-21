
export enum UserType {
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER'
}

export enum LearningStyle {
  VISUAL = 'Visual',
  VERBAL = 'Verbal',
  HANDS_ON = 'Hands-on'
}

export enum ContentPreference {
  EXAMPLE_FIRST = 'Example First',
  EXPLANATION_FIRST = 'Explanation First'
}

export enum MasteryLevel {
  UNFAMILIAR = 'Unfamiliar',
  EMERGING = 'Emerging',
  DEVELOPING = 'Developing',
  SECURE = 'Secure',
  EXAM_READY = 'Exam Ready'
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string; // In real app, never store plain text
  createdAt: number;
}

export interface StudentProfile {
  id: string; // Linked to UserAccount
  name: string;
  xp: number;
  streak: number;
  level: number;
  learningStyle: LearningStyle;
  contentPreference: ContentPreference;
  focusMode: 'Low' | 'Medium' | 'High';
  coins: number;
  targetGrade?: string;
  confidenceLevel?: 'Low' | 'Medium' | 'High';
  weakAreas?: string[]; // The "Villains" of their story
  initialAssessmentComplete?: boolean;
  initialAssessmentSkipped?: boolean;
}

export interface TeacherProfile {
  id: string;
  name: string;
  schoolName: string;
  className: string;
}

export interface SquadFeedItem {
  id: string;
  type: 'system' | 'message' | 'reward' | 'upload' | 'report';
  senderName: string;
  senderRole: UserType | 'SYSTEM';
  text: string;
  timestamp: number;
  metadata?: {
    xp?: number;
    badge?: string;
    fileName?: string;
    grade?: string;
  };
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  mastery: MasteryLevel;
  progress: number; // 0-100
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  status: 'Wishlist' | 'Approved' | 'Redeemed';
  imagePlaceholder: string;
}

export type MicroLessonStepType = 'diagnostic' | 'explanation' | 'worked-example' | 'practice' | 'summary' | 'reward';

export interface MicroLessonStep {
  id: string;
  type: MicroLessonStepType;
  prompt?: string;
  content?: string;
  choices?: string[];
  correctAnswerIndex?: number;
  explanation?: string;
  videoUrl?: string; // YouTube link
  videoTitle?: string;
  videoExplanation?: string; // Why this video fits the student
  videoTags?: string[]; // Classification tags e.g. "Visual Heavy", "Short"
}

export interface MicroLesson {
  id: string;
  topicId: string;
  title: string;
  estimatedMinutes: number;
  steps: MicroLessonStep[];
  isCalibration?: boolean;
}

export interface SessionResult {
  lessonId: string;
  topicId: string;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  newMasteryPercent: number;
  isCalibration?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// --- LEARNING PLAN TYPES (New) ---

export interface PlanTopic {
  topicId: string;
  topicName: string;
  priorityBand: string;
  reason: string;
  recommendedMicroLessons: number;
}

export interface PlanSession {
  sessionNumber: number;
  focus: 'confidence' | 'filling-gaps' | 'exam-prep' | 'mixed';
  topics: PlanTopic[];
}

export interface LearningPlan {
  planHorizonDays: number;
  sessionsPlanned: number;
  sequence: PlanSession[];
  overallStrategy: {
    summary: string;
    percentageWeakFocus: number;
    percentageDevelopingFocus: number;
    percentageReviewFocus: number;
    notesForTeacherOrParent?: string;
  };
  generatedAt: number;
}

export type AppState = {
  userType: UserType;
  isAuthenticated: boolean;
  currentUser: UserAccount | null;
  hasOnboarded: boolean;
  student: StudentProfile;
  topics: Topic[];
  rewards: Reward[];
  squadFeed: SquadFeedItem[];
  teacherProfile?: TeacherProfile;
  learningPlan?: LearningPlan; // Stores the AI generated roadmap
};
