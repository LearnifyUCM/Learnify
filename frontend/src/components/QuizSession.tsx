import React, { useState } from 'react';

// Define the interface for the quiz question structure
interface Question {
    question: string;
    options: string[];
    answer: string; // The correct answer string
}

// Define the component props
interface QuizProps {
    quiz: Question[];
    onExit: () => void;
}

const QuizSession: React.FC<QuizProps> = ({ quiz, onExit }) => {
    // We use a mutable copy to handle review attempts without modifying the prop
    const [studyDeck, setStudyDeck] = useState(quiz);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(quiz.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);

    if (studyDeck.length === 0) {
        return <p className="text-white text-center">No quiz questions available.</p>;
    }

    const currentQuestion = studyDeck[currentIndex];

    const handleAnswer = (selectedOption: string) => {
        // Allow user to change their mind on the current question
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
            setIsFinished(true);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
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
    
    // --- Rendering Logic ---
    
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
    
    const selectedAnswer = userAnswers[currentIndex];
    
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
                    const isCorrectOption = currentQuestion.answer === option;
                    
                    let bgColor = 'bg-gray-700 hover:bg-gray-600';
                    
                    if (isSelected) {
                        bgColor = isFinished ? (isCorrectOption ? 'bg-green-600' : 'bg-red-600') : 'bg-blue-600';
                    } else if (isFinished && isCorrectOption) {
                        bgColor = 'bg-green-800/70 border border-green-500';
                    }

                    return (
                        <button 
                            key={index}
                            onClick={() => handleAnswer(option)}
                            disabled={isFinished}
                            className={`w-full text-left p-4 rounded-lg text-white transition-colors ${bgColor} disabled:opacity-100 disabled:cursor-default`}
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