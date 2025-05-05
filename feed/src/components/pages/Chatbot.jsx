import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const ChatMessage = ({ message, isUser, onUpdate, onDelete, index }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs p-3 rounded-lg ${
          isUser ? "bg-[#006400] text-white" : "bg-[#90EE90] text-black"
        }`}
        dangerouslySetInnerHTML={{ __html: message }}
      />
      {isUser && (
        <div className="flex flex-col items-center mt-2 space-y-1">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => onUpdate(index)}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => onDelete(index)}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        const updated = [...prev.slice(0, -1), {
          ...last,
          text: last.text + nextWord,
        }];
        return updated;
      });
    }, 20 * index);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (data.reply) {
        // Format and animate response
        const responseArray = data.reply.split("**");
        const newResponse = responseArray.map((chunk, i) =>
          i % 2 === 1 ? `<b>${chunk}</b>` : chunk
        ).join("");

        const formatted = newResponse.replace(/\*/g, "<br>");
        const wordArray = formatted.split(" ");

        // Add an empty message first, to update with delay
        setMessages(prev => [...prev, { text: "", isUser: false }]);

        wordArray.forEach((word, i) => delayPara(i, word + " "));
      } else {
        throw new Error("Invalid reply from Gemini");
      }
    } catch (error) {
      console.error("Error during AI generation:", error);
      toast.error("Error during AI generation.");
      setMessages(prev => [
        ...prev,
        { text: "Error: Could not get response from AI.", isUser: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMessage = (index) => {
    const messageToUpdate = messages[index];
    setEditingIndex(index);
    setEditingText(messageToUpdate.text.replace(/<[^>]*>?/gm, '')); // Remove HTML for editing
  };

  const handleSaveUpdate = () => {
    const updatedMessages = messages.map((message, index) =>
      index === editingIndex
        ? { ...message, text: editingText }
        : message
    );
    setMessages(updatedMessages);
    setEditingIndex(null);
    setEditingText("");
  };

  const handleDeleteMessage = (index) => {
    const updatedMessages = messages.filter((_, i) => i !== index && i !== index + 1);
    setMessages(updatedMessages);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-auto p-4 bg-white shadow-md rounded-lg">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            index={index}
            message={msg.text}
            isUser={msg.isUser}
            onUpdate={handleUpdateMessage}
            onDelete={handleDeleteMessage}
          />
        ))}
      </div>

      {editingIndex !== null ? (
        <div className="mt-4 flex">
          <input
            type="text"
            className="p-2 w-full border border-gray-300 rounded-l-lg"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
          />
          <button
            className="p-2 bg-[#006400] text-white rounded-r-lg"
            onClick={handleSaveUpdate}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mt-4 flex">
          <input
            type="text"
            className="p-2 w-full border border-gray-300 rounded-l-lg"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="p-2 bg-[#006400] text-white rounded-r-lg"
            onClick={handleSendMessage}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
