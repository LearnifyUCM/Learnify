import React, { useState, useEffect } from 'react';

interface Question {
    question: string;
    options: string[];
    answer: string; // The correct answer string
}

interface QuizProps {
    quiz: Question[];
    onExit: () => void;
    sessionId: string; // CRITICAL: Used to save results to the backend
}

const QuizSession: React.FC<QuizProps> = ({ quiz, onExit, sessionId }) => {
    const [startTime] = useState(Date.now()); 
    const [studyDeck, setStudyDeck] = useState(quiz);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(quiz.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    
    // Feedback states
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false); // Controls the red/green highlight

    // Explanation states
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [explanationText, setExplanationText] = useState("Loading explanation...");
    const [isExplaining, setIsExplaining] = useState(false);

    // --- State Synchronization Effect ---
    useEffect(() => {
        // When currentIndex changes (going next or back), load the recorded answer
        setSelectedOption(userAnswers[currentIndex] || null);
        
        // Reset feedback state based on whether an answer is recorded for the new question
        if (userAnswers[currentIndex] !== null) {
            setShowFeedback(true); // Show feedback if already answered (e.g., coming back from 'Previous')
        } else {
            setShowFeedback(false); // Hide feedback if the question is fresh
        }
    }, [currentIndex, userAnswers]);


    // --- Core API Call Logic (Remains unchanged) ---
    const sendQuizResults = async (score: number, total: number) => { /* Logic omitted for brevity, assumed functional */ 
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/session/progress/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time_spent_seconds: timeSpent,
                    new_quiz_score: { score, total },
                }),
            });
            if (response.ok) {
                 console.log("Quiz results saved successfully.");
            } else {
                console.error("Failed to save quiz results.");
            }
        } catch (e) {
            console.error("Network error saving quiz results:", e);
        }
    };
    
    const calculateScore = (deck: Question[], answers: string[]) => {
        let score = 0;
        deck.forEach((q, index) => {
            if (answers[index] === q.answer) {
                score++;
            }
        });
        return score;
    };
    const handleExplainError = async () => { /* Logic omitted for brevity */ 
        if (!selectedOption) return;

        setIsExplaining(true);
        setShowExplanationModal(true);
        setExplanationText("Fetching context-aware explanation from Gemini...");
        
        const currentQ = studyDeck[currentIndex];
        const userAnswer = selectedOption; 

        try {
            const response = await fetch(`http://127.0.0.1:5000/explain_error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQ.question,
                    user_answer: userAnswer,
                    correct_answer: currentQ.answer,
                }),
            });
            const result = await response.json();

            if (response.ok) {
                setExplanationText(result.explanation);
            } else {
                setExplanationText(`API Error: ${result.error || 'Could not connect to generate explanation.'}`);
            }

        } catch (e) {
            setExplanationText("Network Error: Could not connect to the explanation service. (Check Flask server)");
        } finally {
            setIsExplaining(false);
        }
    };
    
    // --- Answer Selection and Navigation Logic ---
    
    const handleOptionSelect = (option: string) => {
        if (showFeedback) return; // Cannot change answer after checking
        setSelectedOption(option);
    };

    const handleAdvanceIndex = (finalAnswers: string[]) => {
        // Helper function to safely advance index or finish the quiz
        if (currentIndex < studyDeck.length - 1) {
            setCurrentIndex(currentIndex + 1);
            // State reset is handled by useEffect
        } else {
            // Final calculation and API call
            const finalScore = calculateScore(quiz, finalAnswers); 
            sendQuizResults(finalScore, quiz.length);
            setIsFinished(true);
        }
    };


    const handleNextClick = () => {
        if (!selectedOption) { 
            alert("Please select an answer first!");
            return;
        }

        const currentQ = studyDeck[currentIndex];
        const isAnswerCorrect = selectedOption === currentQ.answer;
        let newAnswers = [...userAnswers];
        
        if (!showFeedback) {
            // 1. First Click (Check Answer): Determine path
            
            // Record answer for current question
            newAnswers[currentIndex] = selectedOption;
            
            if (isAnswerCorrect) {
                // 🚨 CRITICAL FIX: If correct, bypass feedback phase and advance instantly
                setUserAnswers(newAnswers); 
                handleAdvanceIndex(newAnswers);
                return; // EXIT after single click success
            } 
            
            // If INCORRECT, show feedback (Fallthrough)
            setUserAnswers(newAnswers);
            setShowFeedback(true);
            
        } else {
            // 2. Second Click: Move to next question (Button says "Next Question")
            // This path only executes after an INCORRECT answer.
            setShowFeedback(false);
            // State reset handled by the subsequent index change via handleAdvanceIndex
            handleAdvanceIndex(userAnswers);
        }
    };
    
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            // State update handled by useEffect
        }
    };
    
    const startRetrySession = () => { /* Logic remains the same */ 
        const incorrectQuestions: Question[] = studyDeck.filter((q, index) => userAnswers[index] !== q.answer);
        
        if (incorrectQuestions.length === 0) return;

        setStudyDeck(incorrectQuestions);
        setUserAnswers(Array(incorrectQuestions.length).fill(null));
        setCurrentIndex(0);
        setIsFinished(false);
        setIsReviewMode(true);
    };
    
    // Define variables safely
    if (studyDeck.length === 0) { /* (Render empty check) */ 
        return (
            <div className="max-w-xl mx-auto text-center p-8 bg-gray-800 rounded-xl">
                <h3 className="text-2xl font-bold text-white">No Quiz Questions Available</h3>
                <p className="text-gray-300 mt-2">The AI did not generate any quiz questions for this material.</p>
                <button onClick={onExit} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded">
                    Back to Dashboard
                </button>
            </div>
        );
    }
    
    // Define variables used in rendering
    const currentQuestion = studyDeck[currentIndex]; 
    const isCorrect = selectedOption === currentQuestion.answer;


    if (isFinished) { /* (Render final score screen) */ 
        const score = calculateScore(quiz, userAnswers);
        const total = quiz.length;
        const incorrectCount = total - score;
        const allCorrect = incorrectCount === 0;

        return (
            <div className="max-w-xl mx-auto text-center bg-gray-800 p-8 rounded-xl space-y-4 border border-green-500">
                <h3 className="text-3xl font-bold text-white">Quiz Complete!</h3>
                <p className="text-5xl font-extrabold text-green-400">
                    {score} / {total}
                </p>
                <p className="text-lg text-gray-300">Your Score</p>
                
                {!allCorrect && (
                    <p className="text-yellow-400 font-semibold">{incorrectCount} questions need review.</p>
                )}
                
                <div className="pt-4 space-y-3">
                    {!allCorrect && (
                        <button 
                            onClick={startRetrySession}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium"
                        >
                            Retry Incorrect Questions ({incorrectCount})
                        </button>
                    )}
                    <button 
                        onClick={onExit}
                        className={`w-full py-3 rounded-lg font-medium ${allCorrect ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- Quiz Questions View ---
    return (
        <div className="max-w-xl mx-auto space-y-6">
             {/* Modal for Explanation */}
            {showExplanationModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full space-y-4">
                        <h3 className="text-xl font-bold text-cyan-400">Tutor Explanation</h3>
                        <div className="bg-gray-700 p-4 rounded max-h-60 overflow-y-auto text-gray-300 whitespace-pre-wrap">
                            {isExplaining ? 'Generating Explanation...' : explanationText}
                        </div>
                        <button onClick={() => setShowExplanationModal(false)} className="w-full bg-cyan-600 text-white py-2 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}
            
            <h3 className="text-xl text-center text-gray-300">
                {isReviewMode ? 'REVIEW ATTEMPT: ' : 'QUIZ: '}
                Question {currentIndex + 1} of {studyDeck.length}
            </h3>
            
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <p className="text-2xl font-semibold text-white">
                    {currentQuestion.question}
                </p>
            </div>

            <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => {
                    const isCurrentSelection = selectedOption === option;
                    const isAnswerCorrect = option === currentQuestion.answer;
                    
                    let bgColor = 'bg-gray-700 hover:bg-gray-600';
                    let borderColor = 'border-transparent';

                    if (showFeedback) {
                        if (isAnswerCorrect) {
                            // If correct answer, always show green
                            bgColor = 'bg-green-600/50';
                            borderColor = 'border-green-400';
                        } else if (isCurrentSelection) {
                            // If user's WRONG answer, show red
                            bgColor = 'bg-red-600/50';
                            borderColor = 'border-red-400';
                        } else {
                            // Non-selected options are slightly darker gray in feedback mode
                            bgColor = 'bg-gray-800'; 
                            borderColor = 'border-transparent';
                        }
                    } else if (isCurrentSelection) {
                        // If not in feedback mode, just highlight the current selection cyan/blue
                        bgColor = 'bg-cyan-700/50';
                        borderColor = 'border-cyan-400';
                    }

                    return (
                        <button 
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            disabled={showFeedback} // Disable selection after checking
                            className={`w-full text-left p-4 rounded-lg text-white transition-colors border-2 ${bgColor} ${borderColor} disabled:opacity-100 disabled:cursor-default`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            
            {/* 🚨 NEW: Explain My Error Button (Shown ONLY if wrong and in feedback mode) */}
            {showFeedback && !isCorrect && (
                <button onClick={handleExplainError} disabled={isExplaining} className="w-full bg-red-600/70 text-white py-2 rounded transition-colors disabled:bg-red-800">
                    {isExplaining ? 'Generating Explanation...' : 'Explain My Error'}
                </button>
            )}

            <div className="flex justify-between pt-4">
                <button 
                    onClick={handlePrevious}
                    // Disable previous if on Q1 or if feedback is currently showing
                    disabled={currentIndex === 0 || showFeedback} 
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-30"
                >
                    « Previous
                </button>
                <button 
                    onClick={handleNextClick}
                    // Disable if no option is selected AND we are not showing feedback yet
                    disabled={!selectedOption && !showFeedback} 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                    {showFeedback ? 
                        (currentIndex === studyDeck.length - 1 ? 'Finish Quiz' : 'Next Question »') 
                        : 'Check Answer'}
                </button>
            </div>
        </div>
    );
};

export default QuizSession;