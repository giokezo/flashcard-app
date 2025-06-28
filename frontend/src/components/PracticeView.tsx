import React, { useState, useEffect } from 'react';
import type { Flashcard } from '../types'; // Frontend type definition
 // Frontend type definition
import { fetchPracticeCards, submitAnswer, advanceDay } from '../services/api';
import FlashcardDisplay from './FlashcardDisplay';
import { AnswerDifficulty } from '../../../BackEnd/src/logic/flashcards';
import styles from './PracticeView.module.css'; // Import the CSS module

const PracticeView: React.FC = () => {
  const [practiceCards, setPracticeCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);

  const loadPracticeCards = async () => {
    setIsLoading(true);
    setError(null);
    setSessionFinished(false);

    try {
      const { cards, day: newDay } = await fetchPracticeCards();
      // Transform backend Flashcard type to frontend Flashcard type
      const transformedCards: Flashcard[] = cards.map(card => ({
        id: card.front, // Using front as a temporary ID or generate UUID if needed
        front: card.front,
        back: card.back,
        hint: card.hint,
        tags: [...card.tags],
        deckId: card.deckId
      }));
      
      setPracticeCards(transformedCards);
      setDay(newDay);
      
      if (transformedCards.length === 0) {
        setSessionFinished(true);
      }
    } catch (err) {
      setError('Failed to load practice cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPracticeCards();
  }, []);

  const handleShowBack = () => {
    setShowBack(true);
  };

  const handleAnswer = async (difficulty: AnswerDifficulty) => {
    if (currentCardIndex >= practiceCards.length) return;
    
    const currentCard = practiceCards[currentCardIndex];

    try {
      await submitAnswer(currentCard.front, currentCard.back, difficulty);
      const nextIndex = currentCardIndex + 1;

      if (nextIndex < practiceCards.length) {
        setCurrentCardIndex(nextIndex);
        setShowBack(false);
      } else {
        setSessionFinished(true);
      }
    } catch (err) {
      setError('Failed to submit your answer. Please try again.');
    }
  };

  const handleNextDay = async () => {
    try {
      await advanceDay();
      await loadPracticeCards();
      setCurrentCardIndex(0);
    } catch (err) {
      setError('Failed to advance to next day. Please try again.');
    }
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}><p className={styles.loadingText}>Loading your cards...</p></div>;
  }

  if (error) {
    return <div className={styles.errorContainer}><p className={styles.errorText}>{error}</p></div>;
  }

  if (sessionFinished) {
    return (
      <div className={styles.sessionComplete}>
        <h2 className={styles.sessionCompleteTitle}>Session Complete!</h2>
        <p className={styles.sessionCompleteMessage}>Great job! You've completed all your cards for today.</p>
        <button className={`${styles.button} ${styles.nextDayButton}`} onClick={handleNextDay}>Go to Next Day</button>
      </div>
    );
  }

  if (practiceCards.length === 0) {
    return <div className={styles.noCardsContainer}><p className={styles.noCardsText}>No cards to practice today.</p></div>;
  }

  const currentCard = practiceCards[currentCardIndex];

  return (
    <div className={styles.practiceContainer}>
      <div className={styles.header}>
        <div className={styles.appTitle}>Flashcard Learner</div>
        <div className={styles.progressInfo}>
          <span className={styles.dayCounter}>Day {day}</span>
          <span className={styles.progressIndicator}>Card {currentCardIndex + 1} of {practiceCards.length}</span>
        </div>
      </div>
      
      <div className={styles.flashcardContainer}>
        <FlashcardDisplay card={currentCard} showBack={showBack} />
      </div>
      
      <div className={styles.buttonsContainer}>
        {!showBack ? (
          <button 
            className={`${styles.button} ${styles.showAnswerButton}`} 
            onClick={handleShowBack}
          >
            Show Answer
          </button>
        ) : (
          <>
            <button 
              className={`${styles.button} ${styles.easyButton}`} 
              onClick={() => handleAnswer(AnswerDifficulty.Easy)}
            >
              Easy
            </button>
            <button 
              className={`${styles.button} ${styles.hardButton}`} 
              onClick={() => handleAnswer(AnswerDifficulty.Hard)}
            >
              Hard
            </button>
            <button 
              className={`${styles.button} ${styles.wrongButton}`} 
              onClick={() => handleAnswer(AnswerDifficulty.Wrong)}
            >
              Wrong
            </button>
          </>
        )}
      </div>
      
      <div className={styles.footer}>
        <p>© {new Date().getFullYear()} Flashcard Learner</p>
      </div>
    </div>
  );
};

export default PracticeView;