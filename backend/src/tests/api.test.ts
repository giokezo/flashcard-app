import request from "supertest";
import { app } from "../server";
import { getBuckets, setBuckets, incrementDay, getCurrentDay } from "../state";
import { Flashcard, AnswerDifficulty } from "../logic/flashcards";

describe("Flashcard API", () => {
  beforeEach(() => {
    // Reset state before each test if needed
    setBuckets(new Map()); // empty buckets
  });

  describe("GET /api/practice", () => {
    it("returns practice cards and current day", async () => {
      // Setup some cards in bucket 0
      const card = new Flashcard("Q1", "A1", "cat", "hint", []);
      const buckets = new Map();
      buckets.set(0, new Set([card]));
      setBuckets(buckets);

      const res = await request(app).get("/api/practice");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("day");
      expect(res.body).toHaveProperty("cards");
      expect(Array.isArray(res.body.cards)).toBe(true);
      expect(res.body.cards.find((c: any) => c.front === "Q1")).toBeDefined();
    });
  });

  describe("POST /api/update", () => {
    it("updates card bucket and records practice", async () => {
      // Add card to bucket 0
      const card = new Flashcard("Update Q", "Update A", "cat", "hint", []);
      const buckets = new Map();
      buckets.set(0, new Set([card]));
      setBuckets(buckets);

      const res = await request(app)
        .post("/api/update")
        .send({
          cardFront: "Update Q",
          cardBack: "Update A",
          difficulty: AnswerDifficulty.Easy,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Card updated successfully");

      // Verify bucket update
      const newBuckets = getBuckets();
      let foundInNewBucket = false;
      for (const cardSet of newBuckets.values()) {
        if (cardSet.has(card)) foundInNewBucket = true;
      }
      expect(foundInNewBucket).toBe(true);
    });

    it("returns 404 if card not found", async () => {
      const res = await request(app)
        .post("/api/update")
        .send({
          cardFront: "Nonexistent",
          cardBack: "Nope",
          difficulty: AnswerDifficulty.Easy,
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Card not found");
    });

    it("returns 400 on invalid difficulty", async () => {
      const res = await request(app)
        .post("/api/update")
        .send({
          cardFront: "Q",
          cardBack: "A",
          difficulty: "InvalidDifficulty",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid difficulty level");
    });
  });

  describe("GET /api/hint", () => {
  it("returns 400 if query parameters are missing", async () => {
    const res = await request(app).get("/api/hint");
    expect(res.status).toBe(400);
  });

  it("returns 404 if query parameters are empty strings", async () => {
    const res = await request(app).get("/api/hint").query({ cardFront: "", cardBack: "" });
    expect(res.status).toBe(404);
  });

  it("returns 404 if card is not found", async () => {
    const res = await request(app).get("/api/hint").query({ cardFront: "123", cardBack: "true" });
    expect(res.status).toBe(404);
  });

  it("returns hint for existing card with existing hint", async () => {
    // Setup a card with an existing hint
    const card = new Flashcard("Capital of France", "Paris", "geography", "Starts with P", []);
    const buckets = new Map();
    buckets.set(0, new Set([card]));
    setBuckets(buckets);

    const res = await request(app).get("/api/hint").query({ 
      cardFront: "Capital of France", 
      cardBack: "Paris" 
    });
    expect(res.status).toBe(200);
    expect(res.body.hint).toBe("Starts with P");
  });

  it("returns generated hint for card without existing hint", async () => {
    // Setup a card without a hint (empty string)
    const card = new Flashcard("Mathematics", "Math Answer", "subject", "", []);
    const buckets = new Map();
    buckets.set(0, new Set([card]));
    setBuckets(buckets);

    const res = await request(app).get("/api/hint").query({ 
      cardFront: "Mathematics", 
      cardBack: "Math Answer" 
    });
    expect(res.status).toBe(200);
    // Based on your getHint function: "Mathematics" -> "Mat" + 8 asterisks
    expect(res.body.hint).toBe("Mat********");
  });

  it("returns generated hint for short card front", async () => {
    // Setup a card with short front text
    const card = new Flashcard("Hi", "Hello", "greeting", "", []);
    const buckets = new Map();
    buckets.set(0, new Set([card]));
    setBuckets(buckets);

    const res = await request(app).get("/api/hint").query({ 
      cardFront: "Hi", 
      cardBack: "Hello" 
    });
    expect(res.status).toBe(200);
    // Based on your getHint function: "Hi" (length 2) -> "H" + 1 asterisk
    expect(res.body.hint).toBe("H*");
  });
});


  describe("GET /api/progress", () => {
    it("returns progress stats", async () => {
      const res = await request(app).get("/api/progress");
      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
      // Add more assertions if you know the shape of progress stats
    });
  });

  describe("POST /api/day/next", () => {
    it("increments the current day", async () => {
      const initialDay = getCurrentDay();
      const res = await request(app).post("/api/day/next");

      expect(res.status).toBe(200);
      expect(res.body.currentDay).toBe(initialDay + 1);
    });
  });

  describe("POST /api/cards", () => {
    it("adds a new card to bucket 0", async () => {
      const cardData = { front: "NewQ", back: "NewA", hint: "a hint", tags: ["tag1"] };

      const res = await request(app).post("/api/cards").send(cardData);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Card added successfully");

      const buckets = getBuckets();
      const bucket0 = buckets.get(0);
      expect(bucket0).toBeDefined();
      expect([...bucket0!].some(c => c.front === "NewQ" && c.back === "NewA")).toBe(true);
    });

    it("returns 400 if front or back missing", async () => {
      const res = await request(app).post("/api/cards").send({ front: "", back: "" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Front and back text are required");
    });
  });
});
