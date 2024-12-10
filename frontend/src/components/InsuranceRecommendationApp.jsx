import { useState, useRef, useEffect } from "react";
import styles from "./InsuranceRecommendationApp.module.css";

function App() {
  const initialChatHistory = [
    {
      role: "tina",
      text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
    },
  ];

  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState(initialChatHistory);

  // create a ref hook to hold the chat history container element
  const chatHistoryEndRef = useRef(null);

  useEffect(() => {
    // Call backend to initialize AI on page load
    const initializeGenerativeAI = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({}),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          console.log("AI initialized successfully");
        } else {
          console.error("Failed to initialize AI:", response.statusText);
        }
      } catch (error) {
        console.error("Error calling backend:", error);
      }
    };

    initializeGenerativeAI();
  }, []);

  // scroll to the bottom when chatHistory changes
  useEffect(() => {
    if (chatHistoryEndRef.current) {
      chatHistoryEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("User input:", userInput); // Debug log for user input
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userResponse: userInput }), // Ensure userResponse is sent in the body
      });

      console.log("API response:", response); // Debug log for API response

      const data = await response.json();
      setChatHistory([
        ...chatHistory,
        { role: "user", text: userInput },
        { role: "tina", text: data.aiResponse },
      ]);
      console.log("Updated chat history:", chatHistory); // Debug log for chat history
      setUserInput(""); // clear text field after sending

      // ...existing code...
    } catch (error) {
      console.error(
        "❌ Error sending response:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className={styles.container}>
      <img
        className={styles.logo}
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuUSrMhuoa9oRL7pyUTPJASr16X0Pm6Om8yQ&s"
        alt="turners logo"
      />
      <h1 className={styles.heading}>Tina - Your Insurance Consultant</h1>
      <div className={styles.chatHistoryContainer}>
        {chatHistory.map((entry, index) => (
          <div key={index} className={styles.role}>
            <strong>{entry.role === "user" ? "You" : "Tina"}</strong>
            <span>{entry.text}</span>
          </div>
        ))}
        {/* This div is used to scroll to the bottom of chat history */}
        <div ref={chatHistoryEndRef}></div>
      </div>
      <div className={styles.userInputContainer}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className={styles.inputBox}
          placeholder="Type your message..."
        />
        <button onClick={handleSubmit} className={styles.submitButton}>
          Send
        </button>
      </div>
    </div>
  );
}
export default App;
