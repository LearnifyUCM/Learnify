import React, { useState, useEffect } from 'react';

interface Card {
    term: string;
    definition: string;
}

interface CardState extends Card {
    id: number;
    status: 'learned' | 'unlearned';
}

const FlashcardSession = ({ flashcards, onExit, sessionId }: { flashcards: Card[], onExit: () => void, sessionId: string }) => {
    // Session tracking states
    const [startTime] = useState(Date.now()); // Capture start time
    const [masterDeck, setMasterDeck] = useState<CardState[]>(
        flashcards.map((card, index) => ({ ...card, id: index, status: 'unlearned' }))
    );
    const [reviewDeck, setReviewDeck] = useState<CardState[]>(masterDeck);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [sessionMessage, setSessionMessage] = useState<string | null>(null);

    const unlearnedCards = masterDeck.filter(card => card.status === 'unlearned');

    // --- Core API Call to Update Progress ---
    const sendProgressUpdate = async (learnedCount: number, isFinalExit: boolean = false) => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        
        try {
            const response = await fetch(`http://127.0.0.1:5000/session/progress/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    time_spent_seconds: timeSpent,
                    flashcard_learned_count: learnedCount,
                }),
            });
            if (response.ok && isFinalExit) {
                alert(`Progress saved! Time spent: ${timeSpent} seconds.`);
                onExit(); 
            } else if (!response.ok) {
                console.error("Failed to save flashcard progress.");
            }
        } catch (e) {
            console.error("Network error saving progress:", e);
        }
    };
    // ----------------------------------------


    useEffect(() => {
        if (isReviewMode) {
            const nextReviewDeck = masterDeck.filter(card => card.status === 'unlearned');
            
            if (nextReviewDeck.length === 0) {
                sendProgressUpdate(masterDeck.length, true); // Final save and exit
                return;
            }
            
            setReviewDeck(nextReviewDeck);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionMessage(`Reviewing the ${nextReviewDeck.length} cards you still don't know.`);
        } else {
            setReviewDeck(masterDeck);
            setCurrentIndex(0);
        }
    }, [isReviewMode, masterDeck.length]);


    const updateCardStatus = (status: 'learned' | 'unlearned') => {
        if (!currentCard) return;

        setMasterDeck(prevDeck => prevDeck.map(card => 
            card.id === currentCard.id ? { ...card, status } : card
        ));
        
        // Check if the deck is complete and trigger the next state
        if (currentIndex < reviewDeck.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            // End of current deck/review loop: Save current state
            const learnedCount = masterDeck.filter(c => c.status === 'learned').length + (status === 'learned' ? 1 : 0);
            sendProgressUpdate(learnedCount); // Intermediate save

            if (isReviewMode) {
                setIsReviewMode(false); 
                setTimeout(() => setIsReviewMode(true), 10);
            } else {
                setIsReviewMode(true); 
            }
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };
    
    const handleQuitSession = () => {
        const learnedCount = masterDeck.filter(c => c.status === 'learned').length;
        sendProgressUpdate(learnedCount, true); // Final save and exit
    };
    
    const currentCard = reviewDeck[currentIndex];

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h3 className="text-xl text-center text-gray-300">
                {isReviewMode ? 'REVIEW MODE: ' : 'DECK: '}
                Card {currentIndex + 1} of {reviewDeck.length}
                <span className="text-sm block text-gray-400">
                    ({unlearnedCards.length} left to master)
                </span>
            </h3>
            
            {sessionMessage && <div className="p-2 text-center text-sm text-yellow-300 bg-gray-700 rounded">{sessionMessage}</div>}

            <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className="bg-gray-700 p-8 rounded-xl shadow-lg cursor-pointer h-64 flex items-center justify-center transition-all duration-500 transform hover:scale-[1.03]"
            >
                <div className="text-center">
                    <p className="text-sm font-semibold text-cyan-400 mb-2">
                        {isFlipped ? 'DEFINITION' : 'TERM'}
                    </p>
                    <p className="text-3xl font-bold text-white max-h-40 overflow-y-auto">
                        {isFlipped ? currentCard?.definition : currentCard?.term}
                    </p>
                </div>
            </div>
            
            <div className="flex justify-center space-x-4">
                 <button 
                    onClick={() => updateCardStatus('unlearned')}
                    disabled={!isFlipped}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition" 
                >
                    Don't Know / Review
                </button>
                <button 
                    onClick={() => updateCardStatus('learned')}
                    disabled={!isFlipped}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition" 
                >
                    Learned
                </button>
            </div>

            <div className="flex justify-between pt-4">
                <button 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-30"
                >
                    « Previous
                </button>
                 <button 
                    onClick={handleQuitSession}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                >
                    Quit Session
                </button>
            </div>
        </div>
    );
};

export default FlashcardSession;