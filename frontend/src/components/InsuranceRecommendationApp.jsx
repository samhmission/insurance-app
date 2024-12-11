import { useState, useRef, useEffect } from "react";
import styles from "./InsuranceRecommendationApp.module.css";

function App() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "tina",
      text: "I'm Tina. I help you to choose the right insurance policy. May I ask you a few personal questions?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatHistoryEndRef = useRef(null);

  useEffect(() => {
    if (chatHistoryEndRef.current) {
      chatHistoryEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("User input:", userInput);
    try {
      const formattedChatHistory = chatHistory.map((entry) => ({
        role: entry.role === "user" ? "user" : "tina",
        content: entry.text,
      }));

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userResponse: userInput,
          chatHistory: formattedChatHistory,
        }),
      });

      console.log("API response:", response);

      if (!response.ok) {
        setChatHistory([
          ...chatHistory,
          { role: "tina", text: "Sorry, something went wrong!" },
        ]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("API response data:", data);

      setChatHistory([
        ...chatHistory,
        { role: "user", text: userInput },
        { role: "tina", text: data.aiResponse },
      ]);
      console.log("Updated chat history:", chatHistory);
      setUserInput("");
    } catch (error) {
      console.error(
        "❌ Error sending response:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
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
        <button
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={!userInput.trim() || loading}
        >
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
    </div>
  );
}
export default App;
