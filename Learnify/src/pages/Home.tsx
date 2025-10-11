import { useState } from "react";
import FileUpload from "../components/FileUpload";

function Home() {
  const [studySessionName, setStudySessionName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleCreateSession = () => {
    if (studySessionName.trim()) {
      setShowUploadModal(true);
    }
  };

  const closeModal = () => {
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 border-4 border-cyan-400 rounded-full opacity-20"></div>
        <div className="absolute top-20 right-20 w-32 h-32 border-4 border-cyan-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 border-4 border-cyan-400 rounded-full opacity-15"></div>
        <div className="absolute bottom-40 right-1/4 w-48 h-48 border-4 border-cyan-400 rounded-full opacity-25"></div>
        <div className="absolute top-1/2 left-10 w-40 h-40 border-4 border-cyan-400 rounded-full opacity-20"></div>
        <div className="absolute top-1/3 right-10 w-24 h-24 border-4 border-cyan-400 rounded-full opacity-25"></div>
        
        {/* Curved lines */}
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
          <path d="M-100 600 C 300 400, 600 500, 900 300 C 1100 200, 1300 400, 1400 200" stroke="rgb(34, 211, 238)" strokeWidth="3" opacity="0.3" fill="none"/>
          <path d="M-200 700 C 200 500, 500 600, 800 400 C 1000 300, 1200 500, 1400 300" stroke="rgb(34, 211, 238)" strokeWidth="2" opacity="0.2" fill="none"/>
          <path d="M0 400 C 400 300, 700 200, 1000 350 C 1200 450, 1400 300, 1600 400" stroke="rgb(34, 211, 238)" strokeWidth="2" opacity="0.15" fill="none"/>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center w-full max-w-7xl mx-auto px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text content */}
          <div className="text-left">
            <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Learnify
            </h1>
            <p className="text-2xl lg:text-3xl text-gray-300 mb-8 leading-relaxed">
              Transform your PDFs into AI-powered flashcards for smarter studying.
            </p>
            <div className="space-y-4 text-gray-400 text-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Upload any PDF document</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>AI extracts key concepts automatically</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Generate personalized flashcards instantly</span>
              </div>
            </div>
          </div>

          {/* Right side - Input section */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              Create Your Study Session
            </h2>
            
            {/* Study Session Input */}
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Study Session Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter session name (e.g., Biology)"
                  value={studySessionName}
                  onChange={(e) => setStudySessionName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-700 bg-opacity-70 border border-gray-600 rounded-xl text-white placeholder-gray-400 text-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 backdrop-blur-sm transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                />
                <button
                  onClick={handleCreateSession}
                  disabled={!studySessionName.trim()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Give your study session a descriptive name to organize your materials
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Upload PDF for "{studySessionName}"
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <FileUpload />
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Upload your PDF and our AI will automatically extract key concepts and create personalized flashcards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;