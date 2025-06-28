/**
 * Problem Set 1: Flashcards - Algorithm Functions
 *
 * This file contains the implementations for the flashcard algorithm functions
 * as described in the problem set handout.
 */

import { PracticeRecord, ProgressStats } from "../types/index";
import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  // Find the maximum bucket number to create an array of the right size
  const maxBucketNumber = Math.max(
    ...[...buckets.keys()].map(Number),
    0  // Ensure at least 0-length array if no buckets
  );

  // Create an array of empty sets with length maxBucketNumber + 1
  const bucketSets: Array<Set<Flashcard>> = Array.from(
    { length: maxBucketNumber + 1 }, 
    () => new Set()
  );

  // Populate the sets
  for (const [bucketNumber, cardSet] of buckets.entries()) {
    const bucketNum = Number(bucketNumber);
    bucketSets[bucketNum] = new Set(cardSet);
  }

  return bucketSets;
}

export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {
  // Find the indices of non-empty buckets
  const nonEmptyBuckets = buckets
    .map((bucket, index) => ({ bucket, index }))
    .filter(({ bucket }) => bucket.size > 0);

  // If no buckets have cards, return undefined
  if (nonEmptyBuckets.length === 0) {
    return undefined;
  }

  // Find the minimum and maximum bucket indices
  const minBucket = Math.min(...nonEmptyBuckets.map(({ index }) => index));
  const maxBucket = Math.max(...nonEmptyBuckets.map(({ index }) => index));

  return { minBucket, maxBucket };
}

export function practice(
  buckets: ReadonlyArray<Set<Flashcard>>,
  day: number
): Set<Flashcard> {
  return buckets.reduce((practiceCandidates, bucket, index) => {
    if (bucket.size > 0 && (index === 0 || (day % Math.pow(2, index)) === 0)) {
      bucket.forEach(card => practiceCandidates.add(card));
    }
    return practiceCandidates;
  }, new Set<Flashcard>());
}

export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  // Create a new map to avoid mutating the original
  const updatedBuckets = new Map(buckets);

  // Find the current bucket of the card
  let currentBucket = -1;
  for (const [bucket, cardSet] of updatedBuckets.entries()) {
    if (cardSet.has(card)) {
      currentBucket = Number(bucket);
      // Remove from current bucket
      cardSet.delete(card);
      if (cardSet.size === 0) {
        updatedBuckets.delete(bucket);
      }
      break;
    }
  }

  // Determine new bucket based on difficulty
  let newBucket: number;
  switch (difficulty) {
    case AnswerDifficulty.Easy:
      newBucket = Math.min(currentBucket + 2, 7);
      break;
    case AnswerDifficulty.Hard:
      newBucket = Math.min(currentBucket + 1, 7);
      break;
    case AnswerDifficulty.Wrong:
    default:
      newBucket = 0;
  }

  // Add card to new bucket
  if (!updatedBuckets.has(newBucket)) {
    updatedBuckets.set(newBucket, new Set());
  }
  updatedBuckets.get(newBucket)!.add(card);

  return updatedBuckets;
}

export function getHint(card: Flashcard): string {
  // Use the card's existing hint and strengthen it
  const hint = card.hint;
  
  if (hint?.trim() !== "") {
    return hint||"";
  }

  // Fallback to generating a hint if no existing hint
  const front = card.front;
  
  if (front.length <= 3) {
    // For very short strings, return first character
    return front.charAt(0) + '*'.repeat(Math.max(0, front.length - 1));
  }

  // Return first 3 characters + masked rest
  return front.slice(0, 3) + '*'.repeat(Math.max(0, front.length - 3));
}

export function computeProgress(buckets: BucketMap, history: PracticeRecord[]): ProgressStats {
  // Placeholder implementation - you'll want to replace this 
  // with a more meaningful progress calculation based on your specific requirements
  const totalCards = Array.from(buckets.values())
    .reduce((sum, bucket) => sum + bucket.size, 0);

  const progressStages = [
    { name: 'Beginner', minBucket: 0, maxBucket: 1 },
    { name: 'Intermediate', minBucket: 2, maxBucket: 4 },
    { name: 'Advanced', minBucket: 5, maxBucket: 7 }
  ];

  const stageBreakdown = progressStages.map(stage => {
    const stageCards = Array.from(buckets.entries())
      .filter(([bucket]) => 
        Number(bucket) >= stage.minBucket && 
        Number(bucket) <= stage.maxBucket
      )
      .reduce((sum, [, cardSet]) => sum + cardSet.size, 0);

    return {
      stage: stage.name,
      cardCount: stageCards,
      percentage: (stageCards / totalCards) * 100
    };
  });

  return {
    totalCards,
    stageBreakdown
  };
}