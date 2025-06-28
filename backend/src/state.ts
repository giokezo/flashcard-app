// backend/src/state.ts

import { Flashcard, BucketMap, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord } from "./types";

// --- Initial Sample Data ---
const initialCards: Flashcard[] = [
  new Flashcard("Capital of France", "Paris", "geo", "Starts with P", ["europe", "capital"]),
  new Flashcard("2 + 2", "4", "math", "Basic addition", ["math", "easy"]),
  new Flashcard("Water's chemical formula", "H2O", "science", "Two H's, one O", ["chemistry"]),
  new Flashcard("Largest planet", "Jupiter", "space", "Gas giant", ["astronomy"]),
];

// --- In-Memory State ---
let currentBuckets: BucketMap = new Map();
currentBuckets.set(0, new Set(initialCards));

let practiceHistory: PracticeRecord[] = [];
let currentDay: number = 0;

// --- State Accessors & Mutators ---
export function getBuckets(): BucketMap {
  return currentBuckets;
}

export function setBuckets(newBuckets: BucketMap): void {
  currentBuckets = newBuckets;
}

export function getHistory(): PracticeRecord[] {
  return practiceHistory;
}

export function addHistoryRecord(record: PracticeRecord): void {
  practiceHistory.push(record);
}

export function getCurrentDay(): number {
  return currentDay;
}

export function incrementDay(): void {
  currentDay++;
}

// --- Helper Functions ---
export function findCard(front: string, back: string): Flashcard | undefined {
  for (const cardSet of currentBuckets.values()) {
    for (const card of cardSet) {
      if (card.front === front && card.back === back) {
        return card;
      }
    }
  }
  return undefined;
}

export function findCardBucket(cardToFind: Flashcard): number | undefined {
  for (const [bucket, cardSet] of currentBuckets.entries()) {
    if (cardSet.has(cardToFind)) {
      return bucket;
    }
  }
  return undefined;
}

console.log("Initial state loaded: ", {
  buckets: [...currentBuckets.entries()].map(([k, v]) => [k, [...v]]),
  day: currentDay,
  historyLength: practiceHistory.length,
});