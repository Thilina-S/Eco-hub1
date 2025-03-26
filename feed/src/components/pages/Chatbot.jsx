import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

// ChatMessage Component to render each message with update and delete buttons
const ChatMessage = ({ message, isUser, onUpdate, onDelete, index }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs p-3 rounded-lg ${
          isUser ? "bg-[#006400] text-white" : "bg-[#90EE90] text-black"
        }`}
      >
        {message}
      </div>
      {/* Show update and delete icons only for user's messages */}
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

  const handleSendMessage = () => {
    if (input.trim()) {
      // Send user message
      setMessages([...messages, { text: input, isUser: true }]);
      setInput("");

      // Simulate bot response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "I'm here to help! How can I assist you?", isUser: false },
        ]);
      }, 1000);
    }
  };

  const handleUpdateMessage = (index) => {
    const messageToUpdate = messages[index];
    setEditingIndex(index);
    setEditingText(messageToUpdate.text);
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
    // Delete the user message and corresponding bot message (the next message)
    const updatedMessages = messages.filter((_, i) => i !== index && i !== index + 1);
    setMessages(updatedMessages);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-auto p-4 bg-white shadow-md rounded-lg">
        {/* Render all messages */}
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

      {/* If editing a message, show an input field to save the update */}
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
        // If not editing, show the send message input
        <div className="mt-4 flex">
          <input
            type="text"
            className="p-2 w-full border border-gray-300 rounded-l-lg"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="p-2 bg-[#006400] text-white rounded-r-lg"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
