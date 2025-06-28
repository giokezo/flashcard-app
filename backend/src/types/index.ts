import {
  Flashcard as CoreFlashcard,
  AnswerDifficulty as CoreDifficulty,
  BucketMap as CoreBucketMap,
} from "@logic/flashcards";

// --- API Request/Response Types ---

export interface PracticeSession {
  cards: CoreFlashcard[];
  day: number;
}

export interface UpdateRequest {
  cardFront: string;
  cardBack: string;
  difficulty: CoreDifficulty;
}

export interface HintRequest {
  cardFront: string;
  cardBack: string;
}

export interface ProgressStats {
  totalCards: number;
  stageBreakdown: Array<{
    stage: string;
    cardCount: number;
    percentage: number;
  }>;
}

export interface PracticeRecord {
  cardFront: string;
  cardBack: string;
  timestamp: number;
  difficulty: CoreDifficulty;
  previousBucket: number;
  newBucket: number;
}

// --- Re-export Core Types ---

export { CoreFlashcard, CoreDifficulty, CoreBucketMap };