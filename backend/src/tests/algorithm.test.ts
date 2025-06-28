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