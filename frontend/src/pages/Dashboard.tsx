import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom"; 
import FlashcardSession from "../components/FlashcardSession";
import QuizSession from "../components/QuizSession";

// Define the shape of a saved session item (returned by backend /sessions)
interface SavedSessionMeta {
    id: string; // Unique ID used to fetch full material
    name: string;
    created: string; // Date string
    flashcardCount: number;
    quizCount: number;
}

// Define the structure of the AI response (full material)
interface StudyMaterial {
    flashcards?: { term: string; definition: string }[];
    quiz?: { question: string; options: string[]; answer: string }[];
    error?: string;
}

// NOTE: LocalStorage is no longer used for core data storage/retrieval.

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // Data from a fresh upload (Backend returns ID and Name)
    const newSessionIdFromUpload = location.state?.session_id as string;
    const newSessionNameFromUpload = location.state?.session_name as string;

    // --- State Management ---
    const [currentMode, setCurrentMode] = useState('overview'); // 'overview', 'flashcards', 'quiz'
    const [sessionsMetadata, setSessionsMetadata] = useState<SavedSessionMeta[]>([]); 
    const [activeStudyMaterial, setActiveStudyMaterial] = useState<StudyMaterial | null>(null); // CRUCIAL: Holds the data for the session currently being studied
    const [activeSessionName, setActiveSessionName] = useState<string>(""); 

    // Modal State
    const [tempSessionName, setTempSessionName] = useState(""); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // UI states 
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


    // 2. Fetch specific material by ID (used for 'Study Now')
    const fetchSpecificMaterial = useCallback(async (sessionId: string, sessionName: string, mode: 'overview' | 'flashcards' | 'quiz') => {
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

    // Load session list when component mounts AND when the URL pathname changes (solves the refresh bug)
    useEffect(() => {
        fetchSessionMetadata();
    }, [fetchSessionMetadata, location.pathname]);


    // Handle newly uploaded material (if redirected from Home page)
    useEffect(() => {
        if (newSessionIdFromUpload && newSessionNameFromUpload) {
             // CRITICAL: Immediately fetch the newly created session data
            fetchSpecificMaterial(newSessionIdFromUpload, newSessionNameFromUpload, 'overview');
            // Clear location state to prevent re-fetching on refresh
            window.history.replaceState({}, document.title);
        }
    }, [newSessionIdFromUpload, newSessionNameFromUpload, fetchSpecificMaterial]);

    // --- Handlers ---

    const handleStudyNowClick = (sessionMeta: SavedSessionMeta) => {
        // Load material and go to its overview
        fetchSpecificMaterial(sessionMeta.id, sessionMeta.name, 'overview');
    };

    const startStudy = (material: StudyMaterial, mode: 'flashcards' | 'quiz') => {
        setActiveStudyMaterial(material);
        setCurrentMode(mode);
    };

    // 🚨 FIX: This is the handler that resolves the navigational lockup
    const handleExitStudy = () => {
        // 1. Reset the active material state
        setActiveStudyMaterial(null);
        // 2. Set the mode back to overview
        setCurrentMode('overview'); 
        // The main render logic will now display the session list!
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

    // --- RENDER LOGIC ---

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

        const { flashcards, quiz } = activeStudyMaterial;

        // RENDER INTERACTIVE SESSION
        if (currentMode === 'flashcards') {
            return <FlashcardSession flashcards={flashcards || []} onExit={handleExitStudy} />;
        }
        if (currentMode === 'quiz') {
            return <QuizSession quiz={quiz || []} onExit={handleExitStudy} />;
        }

        // Default: Overview Mode
        return (
            <div className="space-y-8 mb-12">
                <h2 className="text-3xl font-bold text-cyan-400 text-center">
                    Study Actions for "{activeSessionName}"
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                </div>
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
                            <div key={session.id} className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                                <h3 className="font-semibold text-white mb-2">{session.name}</h3>
                                <p className="text-sm text-gray-300 mb-3">Created {session.created}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">{session.flashcardCount} flashcards</span>
                                    <button 
                                        onClick={() => handleStudyNowClick(session)}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Study Now
                                    </button>
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