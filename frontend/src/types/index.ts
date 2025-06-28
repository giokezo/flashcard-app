import {
    Flashcard as CoreFlashcard,
    AnswerDifficulty as CoreDifficulty,
    type BucketMap as CoreBucketMap,
} from "../../../BackEnd//src//logic//flashcards";

//API Request/Response Types


export interface PracticeSession {
    cards: CoreFlashcard[];
    day: number;
}

export interface UpdateRequest {
    cardFront: string;
    cardBack: string;
    difficulty: CoreDifficulty;
}

export interface ProgressStats {
    totalCards: number;
    stageBreakdown: Array<{
        stage: string;
        cardCount: number;
        percentage: number;
    }>;
}

export interface Flashcard {
    id: string;            // Required property
    front: string;         // Required property
    back: string;          // Required property
    hint?: string;         // Optional property
    tags: string[];        // Mutable property
    deckId: string;        // Required property
  }

// --- Re-export Core Types ---
export type AnswerDifficulty = CoreDifficulty;
export type BucketMap = CoreBucketMap;