import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom"; 
import FlashcardSession from "../components/FlashcardSession";
import QuizSession from "../components/QuizSession";

// --- INTERFACES (REVISED FOR NULL SAFETY) ---
interface SavedSessionMeta {
    id: string; 
    name: string;
    created: string; 
    flashcardCount: number;
    quizCount: number;
    progress_percent: number; 
    quiz_attempts: number;
}

interface QuizScore {
    timestamp: string;
    score: number;
    total: number;
}

interface ProgressData {
    total_studied_seconds?: number; // Made optional for safety
    flashcard_learned_count?: number; // Made optional for safety
    quiz_history?: QuizScore[]; // CRITICAL: Made optional/can be undefined
    quiz_attempts?: number;
}

interface StudyMaterial {
    flashcards?: { term: string; definition: string }[];
    quiz?: { question: string; options: string[]; answer: string }[];
    error?: string;
    progress?: ProgressData; 
}
// --------------------

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const newSessionIdFromUpload = location.state?.session_id as string;
    const newSessionNameFromUpload = location.state?.session_name as string;

    // --- State Management ---
    const [currentMode, setCurrentMode] = useState('overview'); 
    const [sessionsMetadata, setSessionsMetadata] = useState<SavedSessionMeta[]>([]); 
    const [activeStudyMaterial, setActiveStudyMaterial] = useState<StudyMaterial | null>(null); 
    const [activeSessionName, setActiveSessionName] = useState<string>(""); 

    const [tempSessionName, setTempSessionName] = useState(""); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const BACKEND_URL = 'http://127.0.0.1:5000'; 
    
    // --- API & DATA UTILITIES ---
    
    // 1. Fetch Session Metadata (The list for the dashboard)
    const fetchSessionMetadata = useCallback(async () => {
        setIsProcessing(true);
        try {
            const response = await fetch(`${BACKEND_URL}/sessions`);
            if (response.ok) {
                const metadata: SavedSessionMeta[] = await response.json();
                setSessionsMetadata(metadata);
            } else {
                 setApiError("Could not connect to fetch session list.");
            }
        } catch (e) {
             setApiError("Network error: Backend server is likely offline.");
        } finally {
            setIsProcessing(false);
        }
    }, [BACKEND_URL]);


    // 2. Fetch specific material by ID (used for Study/Progress views)
    const fetchSpecificMaterial = useCallback(async (sessionId: string, sessionName: string, mode: 'overview' | 'flashcards' | 'quiz' | 'progress') => {
        setIsProcessing(true);
        setApiError(null);
        try {
            const response = await fetch(`${BACKEND_URL}/session/${sessionId}`);
            const material: StudyMaterial = await response.json();

            if (response.ok && !material.error) {
                setActiveStudyMaterial(material);
                setActiveSessionName(sessionName);
                setCurrentMode(mode);
            } else {
                setApiError(material.error || "Failed to load session material.");
            }
        } catch (e) {
            setApiError("Network error: Could not connect to retrieve study material.");
        } finally {
            setIsProcessing(false);
        }
    }, [BACKEND_URL]);

    // --- EFFECTS ---

    // Load session list when component mounts AND when the URL pathname changes (solves the list refresh bug)
    useEffect(() => {
        fetchSessionMetadata();
    }, [fetchSessionMetadata, location.pathname]);

    // 🚨 FIX FOR HEADER LOCKUP: Resets active session state if user clicks header link to dashboard
    useEffect(() => {
        if (location.pathname === '/dashboard' && activeStudyMaterial) {
            if (!location.state) {
                setActiveStudyMaterial(null);
                setCurrentMode('overview');
            }
        }
    }, [location.pathname]);

    // Handle newly uploaded material (if redirected from Home page)
    useEffect(() => {
        if (newSessionIdFromUpload && newSessionNameFromUpload) {
            fetchSpecificMaterial(newSessionIdFromUpload, newSessionNameFromUpload, 'overview');
            // Clear location state to prevent re-fetching on refresh
            window.history.replaceState({}, document.title);
        }
    }, [newSessionIdFromUpload, newSessionNameFromUpload, fetchSpecificMaterial]);

    // --- Handlers ---

    const handleStudyNowClick = (sessionMeta: SavedSessionMeta) => {
        fetchSpecificMaterial(sessionMeta.id, sessionMeta.name, 'overview');
    };
    
    // Handler to launch the dedicated Progress View
    const handleViewProgressClick = (sessionMeta: SavedSessionMeta) => {
        fetchSpecificMaterial(sessionMeta.id, sessionMeta.name, 'progress');
    };


    const startStudy = (material: StudyMaterial, mode: 'flashcards' | 'quiz') => {
        setActiveStudyMaterial(material);
        setCurrentMode(mode);
    };

    // FIX: This is the handler that resolves the navigational lockup when EXITING a study session
    const handleExitStudy = () => {
        // 1. Reset the active material state
        setActiveStudyMaterial(null);
        // 2. Set the mode back to overview
        setCurrentMode('overview'); 
        // 3. Force a refresh of the list to show new progress percentage
        fetchSessionMetadata();
    };

    const handleCreateNewSession = () => {
        if (!isProcessing) {
            setShowCreateModal(true);
            setApiError(null);
            setTempSessionName(""); // Clear input on open
        }
    };

    // Submits the new session name from modal and redirects to Home
    const handleSubmitNewSession = () => {
        if (tempSessionName.trim()) {
            // Redirect to Home page's file selection screen
            navigate('/', { state: { openModal: true, sessionName: tempSessionName.trim() } });
            setShowCreateModal(false); // Close dashboard modal
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setTempSessionName("");
    };

    // --- RENDER LOGIC COMPONENTS ---
    
    // Utility to convert seconds to HH:MM:SS format
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.round(seconds % 60);
        return [h, m, s]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0 || i === 2) 
            .join(":");
    };

    // 🚨 FINAL FIX APPLIED HERE 🚨
    const renderProgressView = () => {
        // 🚨 CRITICAL FIX: Use optional chaining and default empty arrays/zeroes
        const progress: ProgressData = activeStudyMaterial?.progress || {};
        const quizHistory = progress.quiz_history || [];
        const totalFlashcards = (activeStudyMaterial?.flashcards || []).length;
        
        return (
            <div className="space-y-8 mb-12 max-w-4xl mx-auto">
                <button onClick={() => setCurrentMode('overview')} className="mb-6 px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600">
                    « Back to Study Actions
                </button>
                <h2 className="text-4xl font-bold text-white text-center mb-6">
                    Progress & Analytics for "{activeSessionName}"
                </h2>

                {/* Overall Stats Grid */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <p className="text-xl font-bold text-cyan-400">{progress.total_studied_seconds ? formatTime(progress.total_studied_seconds) : "00:00"}</p>
                        <p className="text-sm text-gray-400">Total Study Time</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <p className="text-xl font-bold text-cyan-400">{progress.flashcard_learned_count || 0} / {totalFlashcards}</p>
                        <p className="text-sm text-gray-400">Flashcards Mastered</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                        <p className="text-xl font-bold text-cyan-400">{progress.quiz_attempts || 0}</p>
                        <p className="text-sm text-gray-400">Quiz Attempts</p>
                    </div>
                </div>

                {/* Quiz History */}
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h3 className="text-2xl font-semibold text-white mb-4">Quiz History</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {quizHistory.length === 0 ? (
                            <p className="text-gray-400">No quizzes attempted yet.</p>
                        ) : (
                            quizHistory.slice().reverse().map((attempt, index) => ( // Reverse to show latest first
                                <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                    <p className="text-white">Attempt {quizHistory.length - index}</p>
                                    <p className="text-gray-400 text-sm">{new Date(attempt.timestamp).toLocaleTimeString()}</p>
                                    <p className={`font-bold ${attempt.score / attempt.total >= 0.8 ? 'text-green-400' : 'text-red-400'}`}>
                                        {attempt.score} / {attempt.total}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // Renders the study options (flashcards/quiz) for the active material
    const renderActiveMaterialView = () => {
        if (!activeStudyMaterial) return null;

        if (activeStudyMaterial.error) {
            return (
                <div className="bg-red-900 bg-opacity-50 rounded-2xl p-6 border border-red-700 mb-12">
                    <h3 className="text-xl font-semibold text-white">Generation Failed!</h3>
                    <p className="text-sm text-red-300 mt-2">Error: {activeStudyMaterial.error}.</p>
                    <button onClick={handleExitStudy} className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
                        Return to List
                    </button>
                </div>
            );
        }
        
        // 🚨 FIX: RENDER PROGRESS VIEW MODE
        if (currentMode === 'progress') {
            return renderProgressView();
        }

        const { flashcards, quiz } = activeStudyMaterial;
        const currentSessionMeta = sessionsMetadata.find(s => s.name === activeSessionName);
        const sessionId = currentSessionMeta?.id || 'unknown'; 

        // RENDER INTERACTIVE SESSION
        if (currentMode === 'flashcards') {
            return <FlashcardSession flashcards={flashcards || []} onExit={handleExitStudy} sessionId={sessionId} />;
        }
        if (currentMode === 'quiz') {
            return <QuizSession quiz={quiz || []} onExit={handleExitStudy} sessionId={sessionId} />;
        }

        // Default: Overview Mode
        return (
            <div className="space-y-8 mb-12">
                <h2 className="text-3xl font-bold text-cyan-400 text-center">
                    Study Actions for "{activeSessionName}"
                </h2>

                <div className="grid grid-cols-3 gap-8">
                    {/* Flashcards Overview Block */}
                    <div className="bg-gray-800 bg-opacity-70 rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-2xl font-semibold mb-4 text-white">Flashcards ({(flashcards || []).length})</h3>
                        <p className="text-gray-300 mb-6">Review key terms and definitions.</p>
                        <button 
                            onClick={() => startStudy(activeStudyMaterial, 'flashcards')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            Start Flashcard Session
                        </button>
                    </div>

                    {/* Quiz Overview Block */}
                    <div className="bg-gray-800 bg-opacity-70 rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-2xl font-semibold mb-4 text-white">Quiz ({(quiz || []).length})</h3>
                        <p className="text-gray-300 mb-6">Test your knowledge with multiple-choice questions.</p>
                        <button 
                            onClick={() => startStudy(activeStudyMaterial, 'quiz')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            Take Quiz Session
                        </button>
                    </div>
                    
                    {/* View Progress Block */}
                    <div className="bg-gray-800 bg-opacity-70 rounded-2xl p-6 border border-gray-700">
                        <h3 className="text-2xl font-semibold mb-4 text-white">Analytics</h3>
                        <p className="text-gray-300 mb-6">Track your progress and quiz history.</p>
                        <button 
                            onClick={() => setCurrentMode('progress')}
                            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            View Progress
                        </button>
                    </div>
                </div>
                
                <button onClick={handleExitStudy} className="mt-8 px-6 py-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600">
                    Return to Session List
                </button>
            </div>
        );
    };

    // Renders the list of all saved study sessions
    const renderSessionList = () => (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-white">
                Your Study Sessions
            </h2>

            <div className="space-y-4">
                {isProcessing ? (
                    <p className="text-cyan-400 text-center py-4 animate-pulse">Loading sessions from backend...</p>
                ) : (
                    sessionsMetadata.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No study sessions yet. Create one!</p>
                    ) : (
                        sessionsMetadata.map((session, index) => (
                            <div key={session.id} className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 transition-all">
                                
                                <div className="flex justify-between items-start">
                                    {/* Session Info */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white mb-2">{session.name}</h3>
                                        <p className="text-xs text-gray-400 mb-3">Created {session.created}</p>
                                    </div>
                                    
                                    {/* Action Buttons Group */}
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <button 
                                            onClick={() => handleViewProgressClick(session)}
                                            className="bg-cyan-600/50 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            View Progress
                                        </button>
                                        <button 
                                            onClick={() => handleStudyNowClick(session)}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Study Now
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar and Stats */}
                                <div className="mt-4 pt-3 border-t border-gray-600">
                                    <p className="text-xs text-gray-400 mb-1">
                                        Progress: **{session.progress_percent}% mastered** | {session.quiz_attempts} quiz attempt{session.quiz_attempts !== 1 ? 's' : ''}
                                    </p>
                                    <div className="w-full bg-gray-500 rounded-full h-2.5">
                                        <div 
                                            className="bg-cyan-500 h-2.5 rounded-full" 
                                            style={{ width: `${session.progress_percent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-300 mt-2">Cards: {session.flashcardCount} | Quizzes: {session.quizCount}</p>
                                </div>
                            </div>
                        ))
                    )
                )}

                {/* Create New Session button */}
                <div
                    onClick={handleCreateNewSession}
                    className="border-2 border-dashed border-gray-500 rounded-xl p-6 flex flex-col items-center justify-center hover:border-cyan-400 transition-colors cursor-pointer"
                >
                    <div className="text-gray-400 mb-2">
                        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <span className="text-gray-300 text-sm font-medium">Create New Session</span>
                </div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen w-full relative">
            <div className="relative z-10 w-full px-6 lg:px-12 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-white text-center">
                        {activeStudyMaterial ? `Material: ${activeSessionName}` : 'Study Dashboard'}
                    </h1>

                    {/* Error message display is crucial here */}
                    {apiError && (
                        <div className="text-center py-4 bg-red-800 text-white rounded-xl mb-4">
                            API Error: {apiError}
                        </div>
                    )}

                    {/* Conditional rendering based on active study session */}
                    {activeStudyMaterial ? renderActiveMaterialView() : renderSessionList()}
                </div>
            </div>

            {/* Create New Session Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Name Your Session</h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-300 text-sm font-medium mb-3">
                                    Study Session Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Chemistry Midterm Prep"
                                    value={tempSessionName}
                                    onChange={(e) => setTempSessionName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 bg-opacity-70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition-all"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitNewSession}
                                    disabled={!tempSessionName.trim()}
                                    className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                                >
                                    Continue to Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;