export interface Flashcard {
  id: string;
  front: string;
  back: string;
  timestampCreated: number;
  nextReviewDate: number;
  interval: number;
  easeFactor: number;
  repetitions: number;
  sourceUrl: string;
}

export type FlashcardCollection = Record<string, Flashcard>;
