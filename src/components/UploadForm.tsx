import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SESSION_ID_KEY = "sessionId";

const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    let storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!storedSessionId) {
      if (window.crypto && window.crypto.randomUUID) {
        storedSessionId = window.crypto.randomUUID();
      } else {
        storedSessionId = Math.random().toString(36).substring(2, 15);
      }
      sessionStorage.setItem(SESSION_ID_KEY, storedSessionId);
    }
    setSessionId(storedSessionId);
    console.log("Using session ID:", storedSessionId);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && (selected.type === "application/pdf" || selected.type === "text/plain")) {
      setFile(selected);
      setError(null);
    } else {
      setError("Only PDF and TXT files are allowed.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", sessionId);

    try {
      await axios.post("http://18.116.201.186:8000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ Navigate with sessionId in the URL
      navigate(`/chat?sessionId=${sessionId}`);
    } catch (err) {
      setError("Failed to upload file.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input type="file" onChange={handleFileChange} accept=".pdf,.txt" />
      <p className="mt-2 text-sm text-gray-500">Session ID: {sessionId}</p>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload and Start Chat
      </button>
    </div>
  );
};

export default UploadForm;
