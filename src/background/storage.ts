import { Flashcard, FlashcardCollection } from '../types/flashcard';

const STORAGE_KEY = 'flashcards';

export async function getFlashcards(): Promise<FlashcardCollection> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const flashcards: FlashcardCollection = result[STORAGE_KEY] || {};
      resolve(flashcards);
    });
  });
}

export async function saveFlashcards(collection: FlashcardCollection): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: collection }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

export async function addFlashcard(flashcard: Flashcard): Promise<void> {
  const current = await getFlashcards();
  current[flashcard.id] = flashcard;
  await saveFlashcards(current);
}

export async function updateFlashcard(flashcard: Flashcard): Promise<void> {
  const current = await getFlashcards();
  if (!current[flashcard.id]) throw new Error(`Flashcard with id ${flashcard.id} does not exist.`);
  current[flashcard.id] = flashcard;
  await saveFlashcards(current);
}

export async function deleteFlashcard(id: string): Promise<void> {
  const current = await getFlashcards();
  if (current[id]) {
    delete current[id];
    await saveFlashcards(current);
  }
}
