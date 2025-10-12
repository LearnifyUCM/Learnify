import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import FlashcardSession from "../components/FlashcardSession";
import QuizSession from "../components/QuizSession";

// --- INTERFACES ---
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
    total_studied_seconds?: number; 
    flashcard_learned_count?: number; 
    quiz_history?: QuizScore[]; 
    quiz_attempts?: number;
}

interface TimelineItem {
    day: number;
    date: string;
    topics_to_cover: string;
    daily_details: string[];
    estimated_time: string;
    youtube_search_queries: string[];
}

interface StudyMaterial {
    flashcards?: { term: string; definition: string }[];
    quiz?: { question: string; options: string[]; answer: string }[];
    timeline?: TimelineItem[];
    error?: string;
    progress?: ProgressData; 
}
// --------------------

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const newSessionIdFromUpload = location.state?.session_id as string;
    const newSessionNameFromUpload = location.state?.session_name as string;

    const [currentMode, setCurrentMode] = useState<'overview' | 'flashcards' | 'quiz' | 'progress' | 'plan'>('overview'); 
    const [sessionsMetadata, setSessionsMetadata] = useState<SavedSessionMeta[]>([]); 
    const [activeStudyMaterial, setActiveStudyMaterial] = useState<StudyMaterial | null>(null); 
    const [activeSessionName, setActiveSessionName] = useState<string>(""); 
    const [tempSessionName, setTempSessionName] = useState(""); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [sessionToDelete, setSessionToDelete] = useState<SavedSessionMeta | null>(null);

    const BACKEND_URL = 'http://127.0.0.1:5000'; 

    const fetchSessionMetadata = useCallback(async () => {
        setIsProcessing(true);
        setApiError(null);
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

    const fetchSpecificMaterial = useCallback(async (sessionId: string, sessionName: string) => {
        setIsProcessing(true);
        setApiError(null);
        try {
            const response = await fetch(`${BACKEND_URL}/session/${sessionId}`);
            const material: StudyMaterial = await response.json();

            if (response.ok && !material.error) {
                setActiveStudyMaterial(material);
                setActiveSessionName(sessionName);
                setCurrentMode(material.timeline ? 'plan' : 'overview');
            } else {
                setApiError(material.error || "Failed to load session material.");
            }
        } catch (e) {
            setApiError("Network error: Could not connect to retrieve study material.");
        } finally {
            setIsProcessing(false);
        }
    }, [BACKEND_URL]);

    useEffect(() => {
        fetchSessionMetadata();
    }, [fetchSessionMetadata, location.pathname]);

    useEffect(() => {
        if (location.pathname === '/dashboard' && !location.state) {
            setActiveStudyMaterial(null);
            setCurrentMode('overview');
        }
    }, [location.pathname, location.state]);

    useEffect(() => {
        if (newSessionIdFromUpload && newSessionNameFromUpload) {
            fetchSpecificMaterial(newSessionIdFromUpload, newSessionNameFromUpload);
            window.history.replaceState({}, document.title);
        }
    }, [newSessionIdFromUpload, newSessionNameFromUpload, fetchSpecificMaterial]);

    const handleStudyNowClick = (sessionMeta: SavedSessionMeta) => {
        fetchSpecificMaterial(sessionMeta.id, sessionMeta.name);
    };
    
    const handleViewProgressClick = (sessionMeta: SavedSessionMeta) => {
        fetchSpecificMaterial(sessionMeta.id, sessionMeta.name).then(() => {
            setCurrentMode('progress');
        });
    };

    const handleExitStudy = () => {
        setActiveStudyMaterial(null);
        setCurrentMode('overview'); 
        fetchSessionMetadata();
    };

    const handleCreateNewSession = () => {
        if (!isProcessing) {
            setShowCreateModal(true);
            setApiError(null);
            setTempSessionName("");
        }
    };
    
    const handleDeleteClicked = (session: SavedSessionMeta) => {
        setSessionToDelete(session);
    };

    const handleDeleteConfirmed = async () => {
        if (!sessionToDelete) return;
        
        setIsProcessing(true);
        setApiError(null);

        try {
            const response = await fetch(`${BACKEND_URL}/session/${sessionToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSessionToDelete(null);
                fetchSessionMetadata();
            } else {
                const errorResult = await response.json();
                setApiError(errorResult.error || "Failed to delete session.");
                setSessionToDelete(null); 
            }
        } catch (e) {
            setApiError("Network error: Could not connect to delete service.");
            setSessionToDelete(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmitNewSession = () => {
        if (tempSessionName.trim()) {
            navigate('/', { state: { openModal: true, sessionName: tempSessionName.trim() } });
            setShowCreateModal(false);
        }
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setTempSessionName("");
    };
    
    const formatTime = (seconds: number) => {
        if (!seconds) return "0:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.round(seconds % 60);
        const parts = h > 0 ? [h, m, s] : [m, s];
        return parts.map(v => String(v).padStart(2, '0')).join(":");
    };

    const renderActiveMaterialView = () => {
        if (!activeStudyMaterial) return null;

        if (activeStudyMaterial.error) {
            return (
                <div className="bg-red-900 bg-opacity-50 rounded-2xl p-6 border border-red-700 mb-12">
                    <h3 className="text-xl font-semibold text-white">Generation Failed!</h3>
                    <p className="text-sm text-red-300 mt-2">Error: {activeStudyMaterial.error}.</p>
                    <button onClick={handleExitStudy} className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Return to List</button>
                </div>
            );
        }
        
        const sessionId = sessionsMetadata.find(s => s.name === activeSessionName)?.id || 'unknown';

        if (currentMode === 'flashcards' && activeStudyMaterial.flashcards) {
            return <FlashcardSession flashcards={activeStudyMaterial.flashcards} onExit={handleExitStudy} sessionId={sessionId} />;
        }
        if (currentMode === 'quiz' && activeStudyMaterial.quiz) {
            return <QuizSession quiz={activeStudyMaterial.quiz} onExit={handleExitStudy} sessionId={sessionId} />;
        }
        
        if (currentMode === 'plan' && activeStudyMaterial.timeline) {
            const { timeline, flashcards, quiz } = activeStudyMaterial;
            return (
                <div className="space-y-8 mb-12">
                     <h2 className="text-3xl font-bold text-cyan-400 text-center">Your AI-Generated Study Plan for "{activeSessionName}"</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 bg-opacity-70 p-6 rounded-2xl border border-gray-700">
                         <div>
                            <h3 className="text-2xl font-semibold mb-2 text-white">Study Materials</h3>
                            <p className="text-gray-300 mb-4">Use the generated flashcards and quizzes to master the topics in your plan.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                            <button onClick={() => setCurrentMode('flashcards')} className="w-full md:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium">Flashcards ({(flashcards || []).length})</button>
                            <button onClick={() => setCurrentMode('quiz')} className="w-full md:w-auto flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium">Quiz ({(quiz || []).length})</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {timeline.map((item) => (
                            <div key={item.day} className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-start">
                                    <div className="flex-1 mb-4 md:mb-0 md:pr-6">
                                        <p className="text-sm text-cyan-400 font-semibold">Day {item.day} - {new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        <h4 className="text-xl font-bold text-white mt-1">{item.topics_to_cover}</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-300 mt-2 space-y-1 pl-2">
                                            {item.daily_details.map((detail, index) => <li key={index}>{detail}</li>)}
                                        </ul>
                                    </div>
                                    <div className="flex items-start gap-4 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Est. Time</p>
                                            <p className="text-white font-semibold">{item.estimated_time}</p>
                                        </div>
                                        {/* --- ✨ UI IMPROVEMENT --- */}
                                        <div className="flex flex-col space-y-2 items-end">
                                            {item.youtube_search_queries.map((query, index) => (
                                                <a key={index} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" 
                                                   className="bg-gray-800/50 hover:bg-gray-700/70 border border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors"
                                                   title={`Search for "${query}" on YouTube`}>
                                                   <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                                    <span>Resource {index + 1}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleExitStudy} className="mt-8 px-6 py-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600">Return to Session List</button>
                </div>
            );
        }
        
        if (currentMode === 'progress') {
            const { progress, flashcards } = activeStudyMaterial;
            const quizHistory = progress?.quiz_history || [];
            const totalFlashcards = (flashcards || []).length;
            const masteredCount = progress?.flashcard_learned_count || 0;
            const totalStudyTime = progress?.total_studied_seconds || 0;
            const totalQuizAttempts = progress?.quiz_attempts || 0;

            return (
                <div className="space-y-8 mb-12 max-w-4xl mx-auto">
                    <button onClick={() => setCurrentMode(activeStudyMaterial.timeline ? 'plan' : 'overview')} className="mb-6 px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600">« Back to Actions</button>
                    <h2 className="text-4xl font-bold text-white text-center mb-6">Progress & Analytics for "{activeSessionName}"</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-gray-700 rounded-lg"><p className="text-xl font-bold text-cyan-400">{formatTime(totalStudyTime)}</p><p className="text-sm text-gray-400">Total Study Time</p></div>
                        <div className="p-4 bg-gray-700 rounded-lg"><p className="text-xl font-bold text-cyan-400">{masteredCount} / {totalFlashcards}</p><p className="text-sm text-gray-400">Flashcards Mastered</p></div>
                        <div className="p-4 bg-gray-700 rounded-lg"><p className="text-xl font-bold text-cyan-400">{totalQuizAttempts}</p><p className="text-sm text-gray-400">Quiz Attempts</p></div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <h3 className="text-2xl font-semibold text-white mb-4">Quiz History</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {quizHistory.length === 0 ? <p className="text-gray-400">No quizzes attempted yet.</p> : quizHistory.slice().reverse().map((attempt, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                                    <p className="text-white">Attempt {quizHistory.length - index}</p>
                                    <p className="text-gray-400 text-sm">{new Date(attempt.timestamp).toLocaleTimeString()}</p>
                                    <p className={`font-bold ${attempt.score / attempt.total >= 0.8 ? 'text-green-400' : 'text-red-400'}`}>{attempt.score} / {attempt.total}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-8 mb-12">
                <h2 className="text-3xl font-bold text-cyan-400 text-center">Study Actions for "{activeSessionName}"</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-800 bg-opacity-70 rounded-2xl p-6 border border-gray-700"><h3 className="text-2xl font-semibold mb-4 text-white">Flashcards ({(activeStudyMaterial.flashcards || []).length})</h3><p className="text-gray-300 mb-6">Review key terms and definitions.</p><button onClick={() => setCurrentMode('flashcards')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">Start Flashcard Session</button></div>
                    <div className="bg-gray-800 bg-opacity-70 rounded-2xl p-6 border border-gray-700"><h3 className="text-2xl font-semibold mb-4 text-white">Quiz ({(activeStudyMaterial.quiz || []).length})</h3><p className="text-gray-300 mb-6">Test your knowledge.</p><button onClick={() => setCurrentMode('quiz')} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">Take Quiz Session</button></div>
                    <div className="bg-gray-800 bg-opacity-70 rounded-2xl p-6 border border-gray-700"><h3 className="text-2xl font-semibold mb-4 text-white">Analytics</h3><p className="text-gray-300 mb-6">Track your progress.</p><button onClick={() => setCurrentMode('progress')} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-medium">View Progress</button></div>
                </div>
                <button onClick={handleExitStudy} className="mt-8 px-6 py-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600">Return to Session List</button>
            </div>
        );
    };

    const renderSessionList = () => (
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-white">Your Study Sessions</h2>
            <div className="space-y-4">
                {isProcessing ? <p className="text-cyan-400 text-center py-4 animate-pulse">Loading sessions...</p> : sessionsMetadata.length === 0 ? <p className="text-gray-400 text-center py-4">No study sessions yet. Create one!</p> : (
                    sessionsMetadata.map((session) => (
                        <div key={session.id} className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1"><h3 className="font-semibold text-white mb-2">{session.name}</h3><p className="text-xs text-gray-400 mb-3">Created {session.created}</p></div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button onClick={() => handleDeleteClicked(session)} className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded-lg text-sm font-medium">Delete</button>
                                    <button onClick={() => handleViewProgressClick(session)} className="bg-cyan-600/50 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg text-sm font-medium">View Progress</button>
                                    <button onClick={() => handleStudyNowClick(session)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Study Now</button>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-600">
                                <p className="text-xs text-gray-400 mb-1">Progress: {session.progress_percent}% mastered | {session.quiz_attempts} quiz attempt{session.quiz_attempts !== 1 ? 's' : ''}</p>
                                <div className="w-full bg-gray-500 rounded-full h-2.5"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${session.progress_percent}%` }}></div></div>
                                <p className="text-xs text-gray-300 mt-2">Cards: {session.flashcardCount} | Quizzes: {session.quizCount}</p>
                            </div>
                        </div>
                    ))
                )}
                <div onClick={handleCreateNewSession} className="border-2 border-dashed border-gray-500 rounded-xl p-6 flex flex-col items-center justify-center hover:border-cyan-400 cursor-pointer">
                    <div className="text-gray-400 mb-2"><svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
                    <span className="text-gray-300 text-sm font-medium">Create New Session</span>
                </div >
            </div >
        </div >
    );

    return (
        <div className="min-h-screen w-full relative">
            {sessionToDelete && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border border-red-700">
                        <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                        <p className="text-gray-300 mb-6">Are you sure you want to permanently delete the study session: "{sessionToDelete.name}"?</p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setSessionToDelete(null)} className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500">Cancel</button>
                            <button onClick={handleDeleteConfirmed} disabled={isProcessing} className="px-4 py-2 bg-red-700 rounded text-white hover:bg-red-800 disabled:bg-gray-500">{isProcessing ? 'Deleting...' : 'Delete Permanently'}</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="relative z-10 w-full px-6 lg:px-12 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-8 text-white text-center">{activeStudyMaterial ? `Session: ${activeSessionName}` : 'Study Dashboard'}</h1>
                    {apiError && <div className="text-center py-4 bg-red-800 text-white rounded-xl mb-4">API Error: {apiError}</div>}
                    {activeStudyMaterial ? renderActiveMaterialView() : renderSessionList()}
                </div>
            </div>
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Name Your Session</h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-300 text-sm font-medium mb-3">Study Session Name</label>
                                <input type="text" placeholder="e.g., Chemistry Midterm Prep" value={tempSessionName} onChange={(e) => setTempSessionName(e.target.value)} className="w-full px-4 py-3 bg-gray-700 bg-opacity-70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400" />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={closeModal} className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl">Cancel</button>
                                <button onClick={handleSubmitNewSession} disabled={!tempSessionName.trim()} className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-xl">Continue to Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;