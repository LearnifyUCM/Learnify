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
    const [startTime] = useState(Date.now()); // Capture start time
    const [studyDeck, setStudyDeck] = useState(quiz);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(quiz.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);

    // --- Core API Call to Update Progress ---
    const sendQuizResults = async (score: number, total: number) => {
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
            if (!response.ok) {
                console.error("Failed to save quiz results.");
            }
        } catch (e) {
            console.error("Network error saving quiz results:", e);
        }
    };
    // ----------------------------------------
    
    // Calculate final score when finishing
    const calculateScore = (deck: Question[], answers: string[]) => {
        let score = 0;
        deck.forEach((q, index) => {
            if (answers[index] === q.answer) {
                score++;
            }
        });
        return score;
    };


    const handleAnswer = (selectedOption: string) => {
        if (isFinished) return;
        
        const newAnswers = [...userAnswers];
        newAnswers[currentIndex] = selectedOption;
        setUserAnswers(newAnswers);
    };

    const handleNext = () => {
        if (userAnswers[currentIndex] === null) {
            alert("Please select an answer before moving on!");
            return;
        }

        if (currentIndex < studyDeck.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // End of Quiz: Calculate score and trigger API call
            const finalScore = calculateScore(studyDeck, userAnswers);
            sendQuizResults(finalScore, studyDeck.length);
            setIsFinished(true);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };
    
    const startRetrySession = () => {
        const incorrectQuestions: Question[] = studyDeck.filter((q, index) => userAnswers[index] !== q.answer);
        
        if (incorrectQuestions.length === 0) return;

        // Reset and start review mode with only incorrect questions
        setStudyDeck(incorrectQuestions);
        setUserAnswers(Array(incorrectQuestions.length).fill(null));
        setCurrentIndex(0);
        setIsFinished(false);
        setIsReviewMode(true);
    };
    
    // --- RENDERING LOGIC ---
    
    // 🚨 CRITICAL FIX: Add a check for an empty deck before proceeding
    if (studyDeck.length === 0) {
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
    
    // Now that we've checked for an empty deck, we can safely define currentQuestion
    const currentQuestion = studyDeck[currentIndex]; // 🚨 This is the definition that needed the safety check
    const selectedAnswer = userAnswers[currentIndex];

    if (isFinished) {
        const score = calculateScore(studyDeck, userAnswers);
        const total = studyDeck.length;
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
            <h3 className="text-xl text-center text-gray-300">
                {isReviewMode ? 'REVIEW ATTEMPT: ' : 'QUIZ: '}
                Question {currentIndex + 1} of {studyDeck.length}
            </h3>
            
            {/* Question */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <p className="text-2xl font-semibold text-white">
                    {currentQuestion.question}
                </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => {
                    const isSelected = selectedAnswer === option;
                    
                    let bgColor = 'bg-gray-700 hover:bg-gray-600';
                    
                    if (isSelected) {
                        bgColor = 'bg-blue-600';
                    } 

                    return (
                        <button 
                            key={index}
                            onClick={() => handleAnswer(option)}
                            className={`w-full text-left p-4 rounded-lg text-white transition-colors ${bgColor}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <button 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-30"
                >
                    « Previous
                </button>
                <button 
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                    {currentIndex === studyDeck.length - 1 ? 'Finish Quiz' : 'Next Question »'}
                </button>
            </div>
        </div>
    );
};

export default QuizSession;