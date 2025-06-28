export class Flashcard {
  constructor(
    public readonly front: string,        // Required parameter
    public readonly back: string,         // Required parameter
    public readonly deckId: string,       // Required parameter
    public readonly hint?: string,        // Optional parameter
    public readonly tags: ReadonlyArray<string> = [] // Optional parameter with default value
  ) {}
}

export enum AnswerDifficulty {
  Wrong = 0,
  Hard = 1,
  Easy = 2,
}

export type BucketMap = Map<number, Set<Flashcard>>;