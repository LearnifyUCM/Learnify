import React, { useState, useEffect } from 'react';

// --- INTERFACES & UTILITY ---
interface Question {
    question: string;
    options: string[];
    answer: string;
    originalIndex?: number;
}

interface QuizProps {
    quiz: Question[];
    onExit: () => void;
    sessionId: string;
}

const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

// --- COMPONENT ---
const QuizSession: React.FC<QuizProps> = ({ quiz, onExit, sessionId }) => {
    const [startTime] = useState(Date.now()); 
    const [masterAnswers, setMasterAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));
    
    const [studyDeck, setStudyDeck] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [explanationText, setExplanationText] = useState("Loading explanation...");
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => {
        const initialDeck = shuffleArray([...quiz]).map((q, i) => ({
            ...q,
            originalIndex: quiz.indexOf(q),
            options: shuffleArray([...q.options])
        }));
        setStudyDeck(initialDeck);
    }, [quiz]);
    
    useEffect(() => {
        if (studyDeck.length > 0 && currentIndex < studyDeck.length) {
            const { originalIndex } = studyDeck[currentIndex];
            setSelectedOption(masterAnswers[originalIndex!] || null);
            setShowFeedback(masterAnswers[originalIndex!] !== null);
        }
    }, [currentIndex, studyDeck, masterAnswers]);

    const sendQuizResults = async (score: number, total: number) => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        try {
            await fetch(`http://127.0.0.1:5000/session/progress/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time_spent_seconds: timeSpent,
                    new_quiz_score: { score, total },
                }),
            });
        } catch (e) { console.error("Network error saving quiz results:", e); }
    };

    const handleExplainError = async () => {
        if (!selectedOption) return;
        setIsExplaining(true);
        setShowExplanationModal(true);
        setExplanationText("Fetching explanation from the AI...");
        const currentQ = studyDeck[currentIndex];
        try {
            const response = await fetch(`http://127.0.0.1:5000/explain_error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQ.question,
                    user_answer: selectedOption,
                    correct_answer: currentQ.answer,
                }),
            });
            const result = await response.json();
            setExplanationText(response.ok ? result.explanation : `API Error: ${result.error}`);
        } catch (e) {
            setExplanationText("Network Error: Could not connect to the explanation service.");
        } finally {
            setIsExplaining(false);
        }
    };
    
    const handleOptionSelect = (option: string) => { if (!showFeedback) setSelectedOption(option); };
    const handlePrevious = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
    const calculateScore = (deck: Question[], answers: (string|null)[]) => {
        return deck.reduce((score, q, index) => (answers[index] === q.answer ? score + 1 : score), 0);
    };

    const handleNextQuestion = (currentAnswers: (string|null)[]) => {
        if (currentIndex < studyDeck.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            if (!isReviewMode) {
                const score = calculateScore(quiz, currentAnswers);
                sendQuizResults(score, quiz.length);
                setIsFinished(true);
            } else {
                setIsFinished(true);
                setIsReviewMode(false);
            }
        }
    };

    const handleCheckAnswer = () => {
        if (!selectedOption) return;
        
        const { originalIndex } = studyDeck[currentIndex];
        const newMasterAnswers = [...masterAnswers];
        newMasterAnswers[originalIndex!] = selectedOption;
        setMasterAnswers(newMasterAnswers);
        
        setShowFeedback(true);

        if (selectedOption === studyDeck[currentIndex].answer) {
            setTimeout(() => {
                handleNextQuestion(newMasterAnswers);
            }, 1200);
        }
    };
    
    const startRetrySession = () => {
        const incorrectQuestions = quiz
            .map((q, index) => ({ ...q, originalIndex: index }))
            .filter((q, index) => masterAnswers[index] !== q.answer);

        if (incorrectQuestions.length === 0) return;
        
        const shuffledRetryDeck = shuffleArray(incorrectQuestions).map(q => ({
            ...q,
            options: shuffleArray([...q.options])
        }));

        setStudyDeck(shuffledRetryDeck);
        setCurrentIndex(0);
        setIsFinished(false);
        setIsReviewMode(true);
    };
    
    if (studyDeck.length === 0) {
        return (
            <div className="max-w-xl mx-auto text-center p-8 bg-gray-800 rounded-xl">
                <h3 className="text-2xl font-bold text-white">Loading Quiz...</h3>
                <p className="text-gray-300 mt-2">Preparing your questions.</p>
            </div>
        );
    }
    
    if (isFinished) {
        const finalScore = calculateScore(quiz, masterAnswers);
        const total = quiz.length;
        const incorrectCount = total - finalScore;
        const allCorrect = incorrectCount === 0;

        return (
            <div className="max-w-xl mx-auto text-center bg-gray-800 p-8 rounded-xl space-y-4 border border-green-500">
                <h3 className="text-3xl font-bold text-white">{isReviewMode ? "Review Complete!" : "Quiz Complete!"}</h3>
                <p className="text-5xl font-extrabold text-green-400">{finalScore} / {total}</p>
                <p className="text-lg text-gray-300">Your Master Score</p>
                {!allCorrect && <p className="text-yellow-400 font-semibold">{incorrectCount} questions need review.</p>}
                <div className="pt-4 space-y-3">
                    {!allCorrect && <button onClick={startRetrySession} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium">Retry Incorrect Questions ({incorrectCount})</button>}
                    <button onClick={onExit} className={`w-full py-3 rounded-lg font-medium ${allCorrect ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-500 hover:bg-gray-600'}`}>Back to Dashboard</button>
                </div>
            </div>
        );
    }
    
    const currentQuestion = studyDeck[currentIndex];
    const isCorrectOnCheck = showFeedback && selectedOption === currentQuestion.answer;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {showExplanationModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-lg w-full space-y-4">
                        <h3 className="text-xl font-bold text-cyan-400">Tutor Explanation</h3>
                        <div className="bg-gray-700 p-4 rounded max-h-60 overflow-y-auto text-gray-300 whitespace-pre-wrap">{isExplaining ? 'Generating Explanation...' : explanationText}</div>
                        <button onClick={() => setShowExplanationModal(false)} className="w-full bg-cyan-600 text-white py-2 rounded">Close</button>
                    </div>
                </div>
            )}
            
            <h3 className="text-xl text-center text-gray-300">{isReviewMode ? 'REVIEW: ' : 'QUIZ: '}Question {currentIndex + 1} of {studyDeck.length}</h3>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg"><p className="text-2xl font-semibold text-white">{currentQuestion.question}</p></div>

            <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                    let bgColor = 'bg-gray-700 hover:bg-gray-600';
                    let borderColor = 'border-transparent';
                    if (showFeedback) {
                        if (option === currentQuestion.answer) {
                            bgColor = 'bg-green-600/50'; borderColor = 'border-green-400';
                        } else if (selectedOption === option) {
                            bgColor = 'bg-red-600/50'; borderColor = 'border-red-400';
                        }
                    } else if (selectedOption === option) {
                        bgColor = 'bg-cyan-700/50'; borderColor = 'border-cyan-400';
                    }
                    return <button key={index} onClick={() => handleOptionSelect(option)} disabled={showFeedback} className={`w-full text-left p-4 rounded-lg text-white border-2 ${bgColor} ${borderColor} disabled:cursor-default`}>{option}</button>;
                })}
            </div>
            
            <div className="pt-4 space-y-3">
                {!showFeedback && <button onClick={handleCheckAnswer} disabled={!selectedOption} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg disabled:opacity-50">Check Answer</button>}
                {showFeedback && !isCorrectOnCheck && 
                    <>
                        <button onClick={handleExplainError} disabled={isExplaining} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded disabled:bg-orange-800">{isExplaining ? 'Generating...' : 'Explain My Error'}</button>
                        <button onClick={() => handleNextQuestion(masterAnswers)} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg">Next Question »</button>
                    </>
                }
                {showFeedback && isCorrectOnCheck && <p className="text-center text-green-400 font-bold animate-pulse">Correct! Moving to next question...</p>}
            </div>

            <div className="flex justify-center pt-2">
                <button onClick={handlePrevious} disabled={currentIndex === 0 || showFeedback} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-30 text-sm">« Previous</button>
            </div>
        </div>
    );
};

export default QuizSession;