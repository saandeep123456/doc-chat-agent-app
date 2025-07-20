import React from "react";
import UploadForm from "../components/UploadForm";

const Home = () => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold mb-4 text-center">Upload Document</h1>
      <UploadForm />
    </div>
  </div>
);

export default Home;
