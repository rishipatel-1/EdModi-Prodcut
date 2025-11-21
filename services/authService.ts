
import { UserAccount, AppState, StudentProfile, Topic, MasteryLevel, LearningStyle, ContentPreference, UserType, SquadFeedItem, TeacherProfile } from "../types";

const STORAGE_KEY_USERS = 'edmoti_users_db';
const STORAGE_KEY_CURRENT_SESSION = 'edmoti_session';

// --- MOCK DATA INITIALIZERS ---

const INITIAL_TOPICS: Topic[] = [
  // ALGEBRA
  { id: 'alg-1', title: 'Solving Linear Equations', category: 'Algebra', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'alg-2', title: 'Factorising Quadratics', category: 'Algebra', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'alg-3', title: 'Simultaneous Equations', category: 'Algebra', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'alg-4', title: 'Rearranging Formulae', category: 'Algebra', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'alg-5', title: 'Inequalities', category: 'Algebra', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  // GEOMETRY
  { id: 'geo-1', title: 'Pythagoras Theorem', category: 'Geometry', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'geo-2', title: 'Trigonometry (SOH CAH TOA)', category: 'Geometry', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'geo-3', title: 'Angles in Parallel Lines', category: 'Geometry', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'geo-4', title: 'Circle Theorems', category: 'Geometry', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  // NUMBER
  { id: 'num-1', title: 'Laws of Indices', category: 'Number', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'num-2', title: 'Standard Form', category: 'Number', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  { id: 'num-3', title: 'Surds', category: 'Number', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  // RATIO & PROPORTION
  { id: 'rat-1', title: 'Ratio Sharing', category: 'Ratio & Proportion', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
  // STATISTICS
  { id: 'stat-1', title: 'Histograms', category: 'Statistics', mastery: MasteryLevel.UNFAMILIAR, progress: 0 },
];

const INITIAL_FEED: SquadFeedItem[] = [
  { id: 'msg-1', type: 'system', senderName: 'Edmoti HQ', senderRole: 'SYSTEM', text: 'Squad Channel Established. Welcome to the team!', timestamp: Date.now() - 100000 }
];

// Helper to get all users from storage
const getDb = (): Record<string, AppState> => {
    const str = localStorage.getItem(STORAGE_KEY_USERS);
    return str ? JSON.parse(str) : {};
};

// Helper to save all users
const saveDb = (db: Record<string, AppState>) => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(db));
};

export const AuthService = {
    login: async (email: string, password: string): Promise<AppState | null> => {
        await new Promise(r => setTimeout(r, 800));
        
        // MOCK TEACHER LOGIN
        if (email.toLowerCase().includes('teacher')) {
            return {
                userType: UserType.TEACHER,
                isAuthenticated: true,
                currentUser: { id: 'teach-1', email, passwordHash: 'pw', createdAt: Date.now() },
                hasOnboarded: true,
                student: { id: 'mock-std', name: 'Class 11B View', xp: 0, streak: 0, level: 1, learningStyle: LearningStyle.VISUAL, contentPreference: ContentPreference.EXAMPLE_FIRST, focusMode: 'Medium', coins: 0 }, // Dummy
                teacherProfile: { id: 'teach-1', name: 'Mr. Thompson', schoolName: 'Oakwood High', className: 'Year 11 Maths' },
                topics: [], // Teachers see aggregate data usually
                rewards: [],
                squadFeed: INITIAL_FEED
            };
        }

        const db = getDb();
        const userKey = Object.keys(db).find(key => db[key].currentUser?.email.toLowerCase() === email.toLowerCase());
        
        if (userKey) {
            const userData = db[userKey];
            if (userData.currentUser?.passwordHash === password) {
                localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, userKey);
                return userData;
            }
        }
        return null;
    },

    signup: async (email: string, password: string, role: UserType, code?: string): Promise<AppState> => {
        await new Promise(r => setTimeout(r, 1000));
        const db = getDb();
        
        const exists = Object.keys(db).some(key => db[key].currentUser?.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            throw new Error("User already exists");
        }

        // TEACHER
        if (role === UserType.TEACHER) {
             if (code !== 'TEACH123') throw new Error("Invalid School Access Code");
             
             const userId = `teach-${Date.now()}`;
             const newState: AppState = {
                userType: UserType.TEACHER,
                isAuthenticated: true,
                currentUser: { id: userId, email, passwordHash: password, createdAt: Date.now() },
                hasOnboarded: true,
                student: { id: 'dummy', name: 'Dummy', xp: 0, streak: 0, level: 0, learningStyle: LearningStyle.VISUAL, contentPreference: ContentPreference.EXAMPLE_FIRST, focusMode: 'Medium', coins: 0 },
                teacherProfile: { id: userId, name: email.split('@')[0], schoolName: 'Edmoti Academy', className: 'Year 11' },
                topics: [],
                rewards: [],
                squadFeed: INITIAL_FEED
            };
             db[userId] = newState;
             saveDb(db);
             localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, userId);
             return newState;
        }

        // PARENT (Links to a mock student if code provided, or creates new)
        if (role === UserType.PARENT) {
            const userId = `parent-${Date.now()}`;
            // In a real app, we'd look up the student by code. Here we mock it.
            const linkedStudentName = code ? "Linked Student" : "Your Child";
            
            const newState: AppState = {
                userType: UserType.PARENT,
                isAuthenticated: true,
                currentUser: { id: userId, email, passwordHash: password, createdAt: Date.now() },
                hasOnboarded: true,
                student: { 
                    id: 'linked-std', 
                    name: linkedStudentName, 
                    xp: 1200, 
                    streak: 5, 
                    level: 3, 
                    learningStyle: LearningStyle.VISUAL, 
                    contentPreference: ContentPreference.EXAMPLE_FIRST, 
                    focusMode: 'Medium', 
                    coins: 450,
                    weakAreas: ['Algebra'],
                    initialAssessmentComplete: true
                },
                topics: INITIAL_TOPICS, // Should reflect child's topics
                rewards: [],
                squadFeed: INITIAL_FEED
            };
            db[userId] = newState;
            saveDb(db);
            localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, userId);
            return newState;
        }

        // STUDENT
        const userId = `user-${Date.now()}`;
        const newAccount: UserAccount = {
            id: userId,
            email,
            passwordHash: password,
            createdAt: Date.now()
        };

        const newProfile: StudentProfile = {
            id: userId,
            name: email.split('@')[0],
            xp: 0,
            streak: 1,
            level: 1,
            learningStyle: LearningStyle.VISUAL,
            contentPreference: ContentPreference.EXAMPLE_FIRST,
            focusMode: 'Medium',
            coins: 0,
            confidenceLevel: 'Medium',
            initialAssessmentComplete: false
        };

        const newState: AppState = {
            userType: UserType.STUDENT,
            isAuthenticated: true,
            currentUser: newAccount,
            hasOnboarded: false,
            student: newProfile,
            topics: INITIAL_TOPICS,
            rewards: [
                { id: 'r1', title: '1 Hour Gaming Time', cost: 500, status: 'Wishlist', imagePlaceholder: 'https://picsum.photos/400/300?random=1' },
                { id: 'r2', title: 'New Trainers', cost: 5000, status: 'Approved', imagePlaceholder: 'https://picsum.photos/400/300?random=2' },
            ],
            squadFeed: INITIAL_FEED
        };

        db[userId] = newState;
        saveDb(db);
        localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, userId);
        
        return newState;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
    },

    getCurrentSession: (): AppState | null => {
        const userId = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
        if (!userId) return null;
        const db = getDb();
        return db[userId] || null;
    },

    saveProgress: (state: AppState) => {
        if (!state.currentUser?.id) return;
        const db = getDb();
        db[state.currentUser.id] = state;
        saveDb(db);
    },

    // MOCK: Get classroom data for teacher dashboard
    getClassroomData: () => {
        return [
            { id: 's1', name: 'Sam J.', xp: 1250, weakAreas: ['Algebra'], streak: 5, status: 'Online', lastGrade: '5' },
            { id: 's2', name: 'Maya P.', xp: 3400, weakAreas: ['Geometry'], streak: 12, status: 'Offline', lastGrade: '7' },
            { id: 's3', name: 'Leo K.', xp: 800, weakAreas: ['Algebra', 'Number'], streak: 1, status: 'Online', lastGrade: '4' },
            { id: 's4', name: 'Sarah M.', xp: 2100, weakAreas: ['Statistics'], streak: 3, status: 'Offline', lastGrade: '6' },
        ];
    }
};
