import { useState } from "react";

function Dashboard() {
  const [studySessionName, setStudySessionName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleCreateSession = () => {
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setStudySessionName("");
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (studySessionName.trim() && selectedFiles.length > 0) {
      // Here you would typically upload the files and create the session
      console.log("Creating session:", studySessionName, "with files:", selectedFiles);
      closeModal();
    }
  };
  return (
    <div className="min-h-screen w-full relative">
      <div className="relative z-10 w-full px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            Study Dashboard
          </h1>
          
          {/* Quick Actions Bar */}
          <div className="mb-12 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium">
                Upload New PDF
              </button>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium">
                Start Study Session
              </button>
              <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium">
                View Analytics
              </button>
            </div>
          </div>

          {/* Study Sessions */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              Your Study Sessions
            </h2>
            
            {/* Study Sessions Grid */}
            <div className="space-y-4">
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">Biology Chapter 12</h3>
                <p className="text-sm text-gray-300 mb-3">Created 2 hours ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">45 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">Physics Formulas</h3>
                <p className="text-sm text-gray-300 mb-3">Created 1 day ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">23 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">History Notes</h3>
                <p className="text-sm text-gray-300 mb-3">Created 3 days ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-purple-500 text-white px-3 py-1 rounded-full">67 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">Math Equations</h3>
                <p className="text-sm text-gray-300 mb-3">Created 5 days ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full">34 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">Chemistry Basics</h3>
                <p className="text-sm text-gray-300 mb-3">Created 1 week ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full">52 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">Spanish Vocabulary</h3>
                <p className="text-sm text-gray-300 mb-3">Created 1 week ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-full">89 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all">
                <h3 className="font-semibold text-white mb-2">Computer Science Fundamentals</h3>
                <p className="text-sm text-gray-300 mb-3">Created 2 weeks ago</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full">76 flashcards</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Study Now
                  </button>
                </div>
              </div>
              
              {/* Add New Session Card */}
              <div 
                onClick={handleCreateSession}
                className="border-2 border-dashed border-gray-500 rounded-xl p-6 flex flex-col items-center justify-center hover:border-cyan-400 transition-colors cursor-pointer"
              >
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-gray-300 text-sm font-medium">Create New Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Create New Study Session
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Session Name Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Study Session Name
                </label>
                <input
                  type="text"
                  placeholder="Enter session name (e.g., Biology Chapter 12)"
                  value={studySessionName}
                  onChange={(e) => setStudySessionName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-70 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 transition-all"
                />
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Upload PDF Files
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-cyan-400 bg-cyan-400 bg-opacity-10' 
                      : 'border-gray-600 hover:border-cyan-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-300 text-lg font-medium">Drop PDF files here or click to browse</p>
                    <p className="text-gray-500 text-sm mt-1">You can upload multiple PDFs at once</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose Files
                  </label>
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-gray-300 text-sm font-medium mb-3">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-white text-sm">{file.name}</span>
                          <span className="text-gray-400 text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!studySessionName.trim() || selectedFiles.length === 0}
                  className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  Create Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;