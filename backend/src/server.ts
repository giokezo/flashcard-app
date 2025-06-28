import express, { Request, Response } from "express";
import cors from "cors";
import { getBuckets, setBuckets, getHistory, addHistoryRecord, getCurrentDay, incrementDay,
     findCard, findCardBucket } from "./state";
import { toBucketSets, practice, update, getHint, computeProgress } from "./logic/algorithm";
import { Flashcard, AnswerDifficulty } from "./logic/flashcards";
import { PracticeRecord, UpdateRequest, ProgressStats } from "./types";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/practice
app.get("/api/practice", (req: Request, res: Response) => {
  try {
    const day = getCurrentDay();
    const bucketsMap = getBuckets();
    const bucketSets = toBucketSets(bucketsMap);
    const practiceCards = practice(bucketSets, day);
    const cardsArray = Array.from(practiceCards);

    console.log(`Day ${day}: Practice ${cardsArray.length} cards`);
    res.json({ cards: cardsArray, day }); // I'm guessing this does an implicit return, never touched express
  } catch (error) {
    console.error("Error getting practice cards:", error);
    res.status(500).json({ message: "Error fetching practice cards" });
  }
});

// POST /api/update
app.post("/api/update", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack, difficulty } = req.body as UpdateRequest;

    // Validate difficulty
    if (!Object.values(AnswerDifficulty).includes(difficulty)) {
      res.status(400).json({ message: "Invalid difficulty level" });
      return;
    }

    // Find card
    const card = findCard(cardFront, cardBack);
    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // Get current buckets and track previous bucket
    const currentBuckets = getBuckets();
    const previousBucket = findCardBucket(card);

    // Update buckets
    const updatedBuckets = update(currentBuckets, card, difficulty);
    setBuckets(updatedBuckets);

    // Create and add history record
    const newBucket = findCardBucket(card);
    if (previousBucket !== undefined && newBucket !== undefined) {
      const record: PracticeRecord = {
        cardFront: card.front,
        cardBack: card.back,
        timestamp: Date.now(),
        difficulty,
        previousBucket,
        newBucket
      };
      addHistoryRecord(record);
    }

    console.log(`Updated card "${card.front}": Bucket ${previousBucket} → ${newBucket}`);
    res.status(200).json({ message: "Card updated successfully" });
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ message: "Error updating card" });
  }
});

// GET /api/hint
app.get("/api/hint", (req: Request, res: Response) => {
  try {
    const { cardFront, cardBack } = req.query;

    // Validate query params
    if (typeof cardFront !== "string" || typeof cardBack !== "string") {
      res.status(400).json({ message: "Invalid query parameters" });
      return;
    }

    // Find card
    const card = findCard(cardFront, cardBack);
    if (!card) {
      res.status(404).json({ message: "Card not found" });
      return;
    }

    // Get hint
    const hint = getHint(card);
    console.log(`Hint for "${card.front}": ${hint}`);
    res.json({ hint });
  } catch (error) {
    console.error("Error getting hint:", error);
    res.status(500).json({ message: "Error getting hint" });
  }
});

// GET /api/progress
app.get("/api/progress", (_req: Request, res: Response) => {
  try {
    const buckets = getBuckets();
    const history = getHistory();
    
    // Calculate progress statistics
    const progress: ProgressStats = computeProgress(buckets, history);

    console.log("Generated progress stats");
    res.json(progress);
  } catch (error) {
    console.error("Error computing progress:", error);
    res.status(500).json({ message: "Error computing progress" });
  }
});

// POST /api/day/next
app.post("/api/day/next", (_req: Request, res: Response) => {
  try {
    incrementDay();
    const newDay = getCurrentDay();
    
    console.log(`Advanced to Day ${newDay}`);
    res.status(200).json({ 
      message: `Advanced to day ${newDay}`, 
      currentDay: newDay 
    });
  } catch (error) {
    console.error("Error advancing day:", error);
    res.status(500).json({ message: "Error advancing day" });
  }
});

// POST /api/cards - Add a new flashcard
app.post("/api/cards", (req: Request, res: Response) => {
  try {
    const { front, back, hint, tags } = req.body;

    // Validate required fields
    if (!front || !back) {
      res.status(400).json({ message: "Front and back text are required" });
      return;
    }

    // Create new flashcard
    const newCard = new Flashcard(front, back, hint, tags || []);

    // Get current buckets
    const currentBuckets = getBuckets();

    // Add to bucket 0 (new cards)
    if (!currentBuckets.has(0)) {
      currentBuckets.set(0, new Set());
    }

    const bucket0 = currentBuckets.get(0);
    if (bucket0) {
      bucket0.add(newCard);
    }

    // Update state
    setBuckets(currentBuckets);

    console.log(`Added new card: "${front}"`);
    res.status(201).json({
      message: "Card added successfully",
      card: { front, back, hint, tags: tags || [] },
    });
  } catch (error) {
    console.error("Error adding card:", error);
    res.status(500).json({ message: "Error adding card" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Current Day: ${getCurrentDay()}`);
  console.log("Available endpoints:");
  console.log("- GET  /api/practice");
  console.log("- POST /api/update");
  console.log("- GET  /api/hint");
  console.log("- GET  /api/progress");
  console.log("- POST /api/day/next");
  console.log("- POST /api/cards");
});

// Export the Express app
export { app };