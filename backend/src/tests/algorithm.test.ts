import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress
} from '../logic/algorithm';
import { Flashcard, AnswerDifficulty, BucketMap } from '../logic/flashcards';
import { PracticeRecord } from '../types/index';

describe('toBucketSets', () => {
  it('should convert BucketMap to array of sets with correct indices', () => {
    const sampleBucketMap = new Map([
      [0, new Set([
        new Flashcard("What is 2+2?", "4", "math", "Simple addition", []),
        new Flashcard("Capital of France", "Paris", "geo", "City of Light", [])
      ])],
      [1, new Set([new Flashcard("H2O", "Water", "science", "Chemical formula", [])])],
      [3, new Set([
        new Flashcard("sqrt(16)", "4", "math", "Square root", []),
        new Flashcard("Hello in Spanish", "Hola", "lang", "", [])
      ])],
      [5, new Set([new Flashcard("Pi", "3.14159", "math", "", [])])]
    ]);

    const result = toBucketSets(sampleBucketMap);
    
    // Should have length maxBucket + 1 = 6
    expect(result).toHaveLength(6);
    
    // Check bucket 0
    expect(result[0].size).toBe(2);
    
    // Check bucket 1
    expect(result[1].size).toBe(1);
    
    // Check empty bucket 2
    expect(result[2]).toEqual(new Set());
    
    // Check bucket 3
    expect(result[3].size).toBe(2);
    
    // Check empty bucket 4
    expect(result[4]).toEqual(new Set());
    
    // Check bucket 5
    expect(result[5].size).toBe(1);
  });

  it('should handle empty bucket map', () => {
    const emptyMap = new Map<number, Set<Flashcard>>();
    const result = toBucketSets(emptyMap);
    
    expect(result).toEqual([new Set()]);
  });

  it('should handle single bucket', () => {
    const card = new Flashcard("Test", "Answer", "category", "", []);
    const singleBucketMap = new Map([[2, new Set([card])]]);
    const result = toBucketSets(singleBucketMap);
    
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(new Set());
    expect(result[1]).toEqual(new Set());
    expect(result[2]).toEqual(new Set([card]));
  });

  it('should handle non-contiguous bucket numbers', () => {
    const card1 = new Flashcard("Test1", "Answer1", "cat", "", []);
    const card2 = new Flashcard("Test2", "Answer2", "cat", "", []);
    const sparseMap = new Map([
      [0, new Set([card1])],
      [7, new Set([card2])]
    ]);
    const result = toBucketSets(sparseMap);
    
    expect(result).toHaveLength(8);
    expect(result[0]).toEqual(new Set([card1]));
    expect(result[7]).toEqual(new Set([card2]));
    // All buckets in between should be empty
    for (let i = 1; i < 7; i++) {
      expect(result[i]).toEqual(new Set());
    }
  });
});

describe('getBucketRange', () => {
  it('should return correct min and max bucket indices for non-empty buckets', () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>([
        new Flashcard("Test1", "Answer1", "cat", "", [])
      ]),
      new Set<Flashcard>(),
      new Set<Flashcard>([
        new Flashcard("Test2", "Answer2", "cat", "", [])
      ]),
      new Set<Flashcard>(),
      new Set<Flashcard>([
        new Flashcard("Test3", "Answer3", "cat", "", [])
      ])
    ];
    const result = getBucketRange(buckets);
    expect(result).toEqual({ minBucket: 0, maxBucket: 4 });
  });

  it('should return undefined when all buckets are empty', () => {
    const emptyBuckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>(),
      new Set<Flashcard>(),
      new Set<Flashcard>()
    ];
    const result = getBucketRange(emptyBuckets);
    expect(result).toBeUndefined();
  });

  it('should handle single non-empty bucket', () => {
    const card = new Flashcard("Test", "Answer", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>(),
      new Set<Flashcard>([card]),
      new Set<Flashcard>()
    ];
    const result = getBucketRange(buckets);
    expect(result).toEqual({ minBucket: 1, maxBucket: 1 });
  });

  it('should handle bucket at index 0 only', () => {
    const card = new Flashcard("Test", "Answer", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>([card]),
      new Set<Flashcard>(),
      new Set<Flashcard>()
    ];
    const result = getBucketRange(buckets);
    expect(result).toEqual({ minBucket: 0, maxBucket: 0 });
  });

  it('should handle empty array', () => {
    const result = getBucketRange([] as Array<Set<Flashcard>>);
    expect(result).toBeUndefined();
  });
});

describe('practice', () => {
  it('should include all cards from bucket 0 regardless of day', () => {
    const card1 = new Flashcard("Test1", "Answer1", "cat", "", []);
    const card2 = new Flashcard("Test2", "Answer2", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>([card1, card2]),
      new Set<Flashcard>(),
      new Set<Flashcard>()
    ];

    const day1Result = practice(buckets, 1);
    const day7Result = practice(buckets, 7);

    expect(day1Result.has(card1)).toBe(true);
    expect(day1Result.has(card2)).toBe(true);
    expect(day7Result.has(card1)).toBe(true);
    expect(day7Result.has(card2)).toBe(true);
  });

  it('should include bucket 1 cards on even days only', () => {
    const card = new Flashcard("Test", "Answer", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>(),
      new Set<Flashcard>([card]),
      new Set<Flashcard>()
    ];

    const day1Result = practice(buckets, 1);
    const day2Result = practice(buckets, 2);
    const day3Result = practice(buckets, 3);
    const day4Result = practice(buckets, 4);

    expect(day1Result.has(card)).toBe(false);
    expect(day3Result.has(card)).toBe(false);
    expect(day2Result.has(card)).toBe(true);
    expect(day4Result.has(card)).toBe(true);
  });

  it('should include bucket 3 cards every 8 days', () => {
    const card1 = new Flashcard("Test1", "Answer1", "cat", "", []);
    const card2 = new Flashcard("Test2", "Answer2", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = Array.from({ length: 4 }, () => new Set<Flashcard>());
    buckets[3] = new Set<Flashcard>([card1, card2]);

    const day1Result = practice(buckets, 1);
    const day8Result = practice(buckets, 8);
    const day16Result = practice(buckets, 16);
    const day7Result = practice(buckets, 7);

    expect(day1Result.has(card1)).toBe(false);
    expect(day1Result.has(card2)).toBe(false);
    expect(day7Result.has(card1)).toBe(false);
    expect(day7Result.has(card2)).toBe(false);

    expect(day8Result.has(card1)).toBe(true);
    expect(day8Result.has(card2)).toBe(true);
    expect(day16Result.has(card1)).toBe(true);
    expect(day16Result.has(card2)).toBe(true);
  });

  it('should include bucket 5 cards every 32 days', () => {
    const card = new Flashcard("Test", "Answer", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = Array.from({ length: 6 }, () => new Set<Flashcard>());
    buckets[5] = new Set<Flashcard>([card]);

    const day1Result = practice(buckets, 1);
    const day32Result = practice(buckets, 32);
    const day64Result = practice(buckets, 64);
    const day31Result = practice(buckets, 31);

    expect(day1Result.has(card)).toBe(false);
    expect(day31Result.has(card)).toBe(false);
    expect(day32Result.has(card)).toBe(true);
    expect(day64Result.has(card)).toBe(true);
  });

  it('should handle empty buckets gracefully', () => {
    const emptyBuckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>(),
      new Set<Flashcard>(),
      new Set<Flashcard>()
    ];
    const result = practice(emptyBuckets, 1);

    expect(result).toEqual(new Set());
  });

  it('should return new Set instance without mutating input', () => {
    const card = new Flashcard("Test", "Answer", "cat", "", []);
    const buckets: Array<Set<Flashcard>> = [
      new Set<Flashcard>([card]),
      new Set<Flashcard>(),
      new Set<Flashcard>()
    ];
    const originalBuckets = buckets.map(bucket => new Set<Flashcard>(bucket));
    const result = practice(buckets, 1);

    expect(buckets).toEqual(originalBuckets);
    expect(result).not.toBe(buckets[0]);
  });
});
