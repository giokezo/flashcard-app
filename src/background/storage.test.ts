import { chrome } from './__mocks__/chrome';
(global as any).chrome = chrome;

import { saveFlashcards, getFlashcards, addFlashcard, updateFlashcard, deleteFlashcard } from './storage';
import { Flashcard } from '../types/flashcard';

describe('storage module', () => {
  beforeEach(() => {
    chrome.storage.local.clear(() => {});
    (chrome.runtime as any).lastError = null;
  });

  const createFlashcard = (id: string): Flashcard => ({
    id,
    front: 'front',
    back: 'back',
    timestampCreated: Date.now(),
    nextReviewDate: Date.now(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    sourceUrl: 'https://example.com'
  });

  it('should save and retrieve flashcards', async () => {
    const data = { test: createFlashcard('test') };
    await saveFlashcards(data);
    const retrieved = await getFlashcards();
    expect(retrieved).toEqual(data);
  });

  it('should add a flashcard', async () => {
    const card = createFlashcard('abc');
    await addFlashcard(card);
    const all = await getFlashcards();
    expect(all['abc']).toEqual(card);
  });

  it('should update a flashcard', async () => {
    const card = createFlashcard('abc');
    await addFlashcard(card);
    const updated = { ...card, back: 'updated' };
    await updateFlashcard(updated);
    const all = await getFlashcards();
    expect(all['abc'].back).toBe('updated');
  });

  it('should throw when updating a non-existing flashcard', async () => {
    const card = createFlashcard('xyz');
    await expect(updateFlashcard(card)).rejects.toThrow();
  });

  it('should delete a flashcard', async () => {
    const card = createFlashcard('abc');
    await addFlashcard(card);
    await deleteFlashcard('abc');
    const all = await getFlashcards();
    expect(all['abc']).toBeUndefined();
  });

  it('should do nothing when deleting a non-existing flashcard', async () => {
    await expect(deleteFlashcard('nonexistent')).resolves.toBeUndefined();
  });
});
