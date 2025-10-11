import React, { useState, useEffect } from 'react';

// Define the interface for the card structure
interface Card {
    term: string;
    definition: string;
}

// Define the interface for the state of a single card
interface CardState extends Card {
    id: number;
    status: 'learned' | 'unlearned';
}

const FlashcardSession = ({ flashcards, onExit }: { flashcards: Card[], onExit: () => void }) => {
    // Initialize deck with unique IDs and 'unlearned' status
    const initialDeck: CardState[] = flashcards.map((card, index) => ({
        ...card,
        id: index,
        status: 'unlearned',
    }));

    const [masterDeck, setMasterDeck] = useState<CardState[]>(initialDeck); // Full set of cards
    const [reviewDeck, setReviewDeck] = useState<CardState[]>(initialDeck); // The current deck being studied
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [sessionMessage, setSessionMessage] = useState<string | null>(null);

    // Filter cards to get the 'Don't Know' pile
    const unlearnedCards = masterDeck.filter(card => card.status === 'unlearned');

    // --- EFFECT: Re-initialize review deck when entering review mode ---
    useEffect(() => {
        if (isReviewMode) {
            const nextReviewDeck = masterDeck.filter(card => card.status === 'unlearned');
            
            if (nextReviewDeck.length === 0) {
                 // Final completion
                alert('Congratulations! All cards learned!');
                onExit();
                return;
            }
            
            setReviewDeck(nextReviewDeck);
            setCurrentIndex(0);
            setIsFlipped(false);
            setSessionMessage(nextReviewDeck.length > 0 
                ? `Reviewing the ${nextReviewDeck.length} cards you still don't know.` 
                : 'All cards learned! Great job!');
        } else {
            // Initial run or preparing for review check
            setReviewDeck(masterDeck);
            setCurrentIndex(0);
        }
    }, [isReviewMode, masterDeck.length]);
    // Added masterDeck.length dependency to correctly trigger new review round when status changes

    if (masterDeck.length === 0) {
        return <p className="text-white text-center">No flashcards generated for this session.</p>;
    }

    const currentCard = reviewDeck[currentIndex];
    
    // --- Handlers for User Feedback (Learned / Don't Know) ---
    const updateCardStatus = (status: 'learned' | 'unlearned') => {
        if (!currentCard) return;

        // 1. Update the status in the master deck based on the current card's unique ID
        setMasterDeck(prevDeck => prevDeck.map(card => 
            card.id === currentCard.id ? { ...card, status } : card
        ));

        // 2. Automatically move to the next card
        if (currentIndex < reviewDeck.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            // End of current deck/review loop
            if (isReviewMode) {
                // If in review mode, check for the next loop
                setIsReviewMode(false); // Triggers useEffect to re-filter the deck
                setTimeout(() => setIsReviewMode(true), 10);
            } else {
                // End of initial run
                setIsReviewMode(true); // Triggers review mode
            }
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
        }
    };
    
    // --- UI Rendering Logic ---

    // Show initial overview if not started yet
    if (!currentCard) {
         if (unlearnedCards.length === 0 && !isReviewMode) {
             return (
                <div className="max-w-xl mx-auto text-center p-8 bg-gray-800 rounded-xl space-y-4">
                    <h3 className="text-2xl font-bold text-white">Review Complete!</h3>
                    <p className="text-lg text-gray-300">All {masterDeck.length} cards mastered.</p>
                    <button onClick={onExit} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg">
                        Back to Dashboard
                    </button>
                </div>
            );
         }
    }


    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h3 className="text-xl text-center text-gray-300">
                {isReviewMode ? 'REVIEW MODE: ' : 'DECK: '}
                Card {currentIndex + 1} of {reviewDeck.length}
                <span className="text-sm block text-gray-400">
                    ({unlearnedCards.length} left to master)
                </span>
            </h3>
            
            {/* Session Message */}
            {sessionMessage && <div className="p-2 text-center text-sm text-yellow-300 bg-gray-700 rounded">{sessionMessage}</div>}

            {/* The Flippable Card Area */}
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
            
            {/* 🚨 NEW: Status Buttons (Visible only when flipped) */}
            <div className="flex justify-center space-x-4">
                 <button 
                    // Call the status update handler directly
                    onClick={() => updateCardStatus('unlearned')}
                    disabled={!isFlipped}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition" // Muted Yellow/Orange
                >
                    Don't Know / Review
                </button>
                <button 
                    // Call the status update handler directly
                    onClick={() => updateCardStatus('learned')}
                    disabled={!isFlipped}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 transition" // Green
                >
                    Learned
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
                <button 
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-30"
                >
                    « Previous
                </button>
                 <button 
                    onClick={onExit}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg"
                >
                    Quit Session
                </button>
            </div>
        </div>
    );
};

export default FlashcardSession;