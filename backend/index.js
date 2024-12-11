const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    candidateCount: 1,
    stopSequences: ["x"],
    maxOutputTokens: 100,
    temperature: 1.0,
  },
});

// Function to create prompt
function createPrompt(userResponse, chatHistory) {
  const fullHistory = [
    ...(Array.isArray(chatHistory) ? chatHistory : []),
    { role: "user", content: userResponse },
  ];
  const prompt = `You are Tina, an AI insurance consultant. You will ask questions to determine the best insurance policy for a customer based on their answers.
  The conversation should follow a structured format of questions and responses, only one question should be asked at a time.
  You have access to three car insurance products:

  * **Mechanical Breakdown Insurance (MBI):** Covers mechanical failures. Not available for trucks or racing cars.
  * **Comprehensive Car Insurance:** Covers a wider range of events including accidents and theft. Only available for vehicles less than 10 years old.
  * **Third Party Car Insurance:** Covers damage caused to other people's property or injuries to other people.

  Conversation History:
  ${fullHistory.map((item) => `${item.role}: ${item.content}`).join("\n")}

  Based on the conversation history, respond appropriately. If this is the first interaction, ask if the user wants help choosing an insurance policy, then proceed to gather information and give a recommendation at the end.`;

  return prompt;
}

// /api/chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { userResponse, chatHistory } = req.body;
    const prompt = createPrompt(userResponse, chatHistory);

    const response = (await model.generateContent(prompt)).response;
    console.log("AI response:", response.text());

    const updatedChatHistory = [
      ...(Array.isArray(chatHistory) ? chatHistory : []),
      { role: "user", content: userResponse },
      { role: "Tina", content: response.text() },
    ];

    res.json({ aiResponse: response.text(), chatHistory: updatedChatHistory });
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    res.status(500).json({ error: "Failed to generate response." });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Connected");
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Endpoint not found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
