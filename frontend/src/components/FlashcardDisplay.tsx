import React, { useState } from 'react';
import { fetchHint } from '../services/api';
import styles from './FlashcardDisplay.module.css';

// Define the Flashcard type if it's not imported from '../types'
interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  tags: string[];
  deckId: string;
}

interface FlashcardDisplayProps {
  card: Flashcard;
  showBack: boolean;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({ card, showBack }) => {
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const handleGetHint = async () => {
    try {
      setLoadingHint(true);
      setHintError(null);
      const hintText = await fetchHint(card);
      setHint(hintText);
    } catch (error) {
      console.error('Error fetching hint:', error);
      setHintError('Failed to load hint. Please try again.');
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className={styles.flashcard}>
      <div className={styles.flashcardContent}>
        <div className={styles.flashcardSection}>
          <h3 className={styles.sectionTitle}>Question:</h3>
          <p className={styles.cardText}>{card.front}</p>
        </div>
        
        <div className={styles.flashcardSection}>
          <h3 className={styles.sectionTitle}>Answer:</h3>
          <p className={styles.cardText}>{showBack ? card.back : '???'}</p>
        </div>
        
        {!showBack && (
          <div className={styles.hintSection}>
            {!hint && !loadingHint && !hintError && (
              <button 
                onClick={handleGetHint} 
                disabled={loadingHint}
                className={styles.hintButton}
              >
                Get Hint
              </button>
            )}
            
            {loadingHint && <p className={styles.loadingText}>Loading hint...</p>}
            
            {hintError && (
              <div className={styles.hintError}>
                <p>{hintError}</p>
                <button onClick={handleGetHint} className={styles.retryButton}>
                  Try Again
                </button>
              </div>
            )}
            
            {hint && (
              <div className={styles.hintDisplay}>
                <h4 className={styles.hintTitle}>Hint:</h4>
                <p className={styles.hintText}>{hint}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardDisplay;