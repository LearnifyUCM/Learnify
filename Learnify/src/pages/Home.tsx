import { useState } from "react";

function Home() {
  const [studySessionName, setStudySessionName] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleCreateSession = () => {
    if (studySessionName.trim()) {
      setShowFileUpload(true);
    }
  };

  const handleBack = () => {
    setShowFileUpload(false);
    setSelectedFiles([]);
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

  const handleFileUploadDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (studySessionName.trim() && selectedFiles.length > 0) {
      console.log('Creating session:', studySessionName, 'with files:', selectedFiles);
      // Reset and go back to initial state
      setShowFileUpload(false);
      setStudySessionName("");
      setSelectedFiles([]);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative py-16">
      <div className="relative z-10 text-center w-full px-6 lg:px-12 mt-8">
        <div className="max-w-7xl mx-auto">
          
          {!showFileUpload ? (
            // Initial name input screen
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Create Your Study Session
                </h2>
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
          ) : (
            // Minimalistic file upload screen
            <div className="max-w-2xl mx-auto">
              {/* Simple Header */}
              <div className="flex items-center mb-8">
                <button
                  onClick={handleBack}
                  className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Upload PDFs</h1>
                  <p className="text-gray-400">for "{studySessionName}"</p>
                </div>
              </div>

              {/* Minimalistic Upload Card */}
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-8">
                {/* Simple Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-16 text-center transition-colors ${
                    dragActive 
                      ? 'border-cyan-400 bg-cyan-400/5' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleFileUploadDrop}
                >
                  {/* Simple Upload Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-medium text-white mb-2">
                    Ready for your PDFs
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Drag and drop your PDF files or click to browse
                  </p>

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
                    className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Choose PDF Files
                  </label>
                </div>

                {/* Minimalistic Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-4">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                    </h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{file.name}</p>
                              <p className="text-gray-400 text-xs">{Math.round(file.size / 1024)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-red-400 transition-colors"
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

                {/* Simple Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={selectedFiles.length === 0}
                    className="flex-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Generate Study Session ({selectedFiles.length})
                  </button>
                </div>

                {selectedFiles.length === 0 && (
                  <p className="text-gray-500 text-sm text-center mt-4">
                    Upload at least one PDF to continue
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;