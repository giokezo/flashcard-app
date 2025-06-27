import { addFlashcard, getFlashcards } from './storage';
import { Flashcard } from '../types/flashcard';

const newFlashcard: Flashcard = {
  id: 'id1',
  front: 'Example question',
  back: 'Example answer',
  timestampCreated: Date.now(),
  nextReviewDate: Date.now() + 24 * 60 * 60 * 1000,
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
  sourceUrl: 'https://example.com'
};

(async () => {
  await addFlashcard(newFlashcard);
  const all = await getFlashcards();
  console.log('All flashcards:', all);
})();
