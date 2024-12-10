const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();

// middleware
app.use((req, res, next) => {
  console.log(`${req.method} request received to ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());

// AI configuration
const systemInstructions = `
  system_instruction:
    description: |
    Tina is an AI that helps users select the best insurance policy by asking a series of personalized questions based on user responses. 
        The AI should always begin with an opt-in question asking if the user agrees to answer personal questions to recommend a suitable policy. 
        If the user agrees, Tina will continue by asking relevant questions, dynamically adjusting based on the user's responses, and avoid asking for specific product preferences directly.
    products:
        - name: Mechanical Breakdown Insurance (MBI)
        description: Covers vehicle repairs and breakdowns.
        - name: Comprehensive Car Insurance
        description: Covers both third-party liabilities and damage to the user's own vehicle.
        - name: Third Party Car Insurance
        description: Covers damages to third-party vehicles and property.
    business_rules:
        - MBI_is_not_available_for:
            - trucks
            - racing_cars
        - Comprehensive_Car_Insurance_is_available_for_vehicles_under_10_years_old: true
    guidelines:
        opt_in_question: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?"
        question_approach: |
            - Tina will not directly ask "what insurance product do you want?"
            - Tina will ask clarifying questions such as:
            - "Do you need coverage for your own car or just third-party liability?"
            - "How old is your vehicle?"
            - "What type of vehicle do you drive (e.g., sedan, truck, sports car)?"
        recommendations:
            - At the end of the conversation, Tina will recommend one or more insurance policies based on user responses.
            - Tina will provide clear reasoning for each recommendation.
        response_adjustments:
            - Tina will adjust questions and recommendations dynamically based on user responses.
            - Tina will follow business rules for product eligibility.
        tone:
            professional: true
            respectful: true
            user_focused: true`;

// Initialize chatSession with null
let chatSession = null;

// initial prompt

// Function to initialize generative AI model
async function initializeGenerativeAI() {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API key is missing in environment variables.");
    }

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = await genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstructions,
      generationConfig: {
        candidateCount: 1,
        stopSequences: ["x"],
        maxOutputTokens: 1000,
        temperature: 1.0,
      },
    });
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
            },
          ],
        },
      ],
    });
    console.log("✅ AI model initialized");
    let result = await chat.sendMessage("I agree");
    console.log(result);
    return model;
  } catch (error) {
    console.error("❌ Error initializing AI model:", error);
    throw new Error("Error initializing AI model");
  }
}

// Endpoint to handle chat messages
app.post("/api/chat", async (req, res) => {
  console.log("req.body", req.body); // Debug log for request body
  const { userResponse } = req.body;
  console.log("API Chat endpoint hit");
  console.log("User response:", userResponse);

  if (!userResponse) {
    console.error("❌ User response is empty");
    return res.status(400).json({
      error: "User response is empty. Please provide a valid response.",
    });
  }

  try {
    const model = await initializeGenerativeAI();

    const initialChatHistory = [
      {
        role: "user",
        parts: [
          {
            text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
          },
        ],
      },
    ];

    chatSession = model.startChat({
      history: initialChatHistory,
    });

    console.log(chatSession.history);

    if (!chatSession) {
      return res.status(400).json({
        error: "Chat session is not initialized. Please try again.",
      });
    }

    const result = (await chatSession.sendMessage(userResponse)).response;
    console.log("RESULT: ", result);
    let aiResponse = result.text();
    res.json({ aiResponse });
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    res.status(500).json({
      error: "Failed to generate response.",
      details: error.message,
    });
  }
});

// Root route for checking server status
app.get("/", (req, res) => {
  res.send("Connected my dudes 🔌");
});

// 404 handler for unrecognized routes
app.use((req, res) => {
  res.status(404).send("Endpoint not found");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
