import React, { useEffect, useState } from "react";
import ChatBox, { Message } from "../components/ChatBox";
import ChatSidebar from "../components/ChatSidebar";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "react-router-dom";

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const LOCAL_KEY = "chatHistory";
const SESSION_ID_KEY = "sessionId";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Chat: React.FC = () => {
  const query = useQuery();
  const urlSessionId = query.get("sessionId"); // 🔧 grab sessionId from URL

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>("");

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // 🔧 Step 1: Decide and persist session ID
  useEffect(() => {
    let activeSessionId = urlSessionId || sessionStorage.getItem(SESSION_ID_KEY);

    if (!activeSessionId) {
      activeSessionId = uuidv4();
    }

    setSessionId(activeSessionId);
    sessionStorage.setItem(SESSION_ID_KEY, activeSessionId);
    console.log("Using session ID:", activeSessionId);
  }, [urlSessionId]);

  // 🔧 Step 2: Load sessions from localStorage (if any), then fallback to backend
  useEffect(() => {
    if (!sessionId) return;

    const localSessions = localStorage.getItem(LOCAL_KEY);
    const parsedSessions = localSessions ? JSON.parse(localSessions) : [];

    // Load from local if matching sessionId is found
    const existing = parsedSessions.find((s: ChatSession) =>
      s.messages.some((m: Message) => m.content.includes(sessionId))
    );

    if (existing) {
      setSessions(parsedSessions);
      setCurrentSessionId(existing.id);
    } else {
      // 🔧 Otherwise, fetch from backend
      axios
        .get(`http://18.116.201.186:8000/history/${sessionId}`)
        .then((res) => {
          const rawMessages = res.data.messages || [];

          if (rawMessages.length > 0) {
            const messages: Message[] = rawMessages.map((msg: any) => ({
              role: msg.role === "bot" ? "agent" : "user",
              content: msg.text || msg.content,
            }));

            const newSession: ChatSession = {
              id: uuidv4(),
              title: messages[0]?.content?.slice(0, 30) || "Imported Chat",
              messages,
              createdAt: new Date().toISOString(),
            };

            setSessions([newSession]);
            setCurrentSessionId(newSession.id);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch history:", err);
        });
    }
  }, [sessionId]);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const startNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setInput("");
  };

  const updateMessages = (newMessages: Message[]) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: newMessages, title: newMessages[0]?.content || "Chat" }
          : s
      )
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession) return;

    const newMessages: Message[] = [...currentSession.messages, { role: "user", content: input }];
    updateMessages(newMessages);

    const formData = new FormData();
    formData.append("question", input);
    formData.append("user_id", sessionId);

    try {
      const res = await axios.post("http://18.116.201.186:8000/ask", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const reply: Message = { role: "agent", content: res.data.answer || "No response." };
      updateMessages([...newMessages, reply]);
      setInput("");
    } catch {
      updateMessages([...newMessages, { role: "agent", content: "Error getting response." }]);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar
        sessions={sessions.map(({ id, title }) => ({ id, title }))}
        onSelect={(id) => setCurrentSessionId(id)}
        onNewChat={startNewChat}
      />

      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{currentSession?.title || "No chat selected"}</h2>
          {currentSession && (
            <button
              onClick={() => {
                const updated = sessions.filter((s) => s.id !== currentSessionId);
                setSessions(updated);
                setCurrentSessionId(updated[0]?.id || null);
              }}
              className="text-sm text-red-500 border border-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white"
            >
              Delete Chat
            </button>
          )}
        </div>

        {currentSession ? (
          <ChatBox
            messages={currentSession.messages}
            input={input}
            setInput={setInput}
            onSend={sendMessage}
          />
        ) : (
          <div className="text-center text-gray-500 mt-20">
            Select a chat or start a new one.
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
