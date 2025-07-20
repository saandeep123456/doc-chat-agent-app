import React from "react";

export type MessageRole = "user" | "agent";

export interface Message {
  role: MessageRole;
  content: string;
}

interface ChatBoxProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, input, setInput, onSend }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2 px-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl p-2 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 self-end ml-auto"
                : "bg-gray-100 self-start mr-auto"
            }`}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div className="flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border px-4 py-2 rounded-l outline-none"
        />
        <button
          onClick={onSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
