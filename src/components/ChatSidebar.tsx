import React from "react";

interface ChatSidebarProps {
  sessions: { id: string; title: string }[];
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ sessions, onSelect, onNewChat }) => {
  return (
    <div className="w-64 border-r p-4 bg-white">
      <button
        onClick={onNewChat}
        className="mb-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        New Chat
      </button>

      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s.id)}
              className="w-full text-left mb-2 p-2 hover:bg-gray-100 rounded"
            >
              {s.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatSidebar;
