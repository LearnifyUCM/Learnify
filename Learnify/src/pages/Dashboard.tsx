import { useState } from "react";

function Dashboard() {
  const [studySessionName, setStudySessionName] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [insertPosition, setInsertPosition] = useState<'before' | 'after' | null>(null);
  const [studySessions, setStudySessions] = useState([
    { id: 1, name: "Biology Chapter 12", created: "2 hours ago", flashcards: 45, color: "green" },
    { id: 2, name: "Physics Formulas", created: "1 day ago", flashcards: 23, color: "blue" },
    { id: 3, name: "History Notes", created: "3 days ago", flashcards: 67, color: "purple" },
    { id: 4, name: "Math Equations", created: "5 days ago", flashcards: 34, color: "orange" },
    { id: 5, name: "Chemistry Basics", created: "1 week ago", flashcards: 52, color: "red" },
    { id: 6, name: "Spanish Vocabulary", created: "1 week ago", flashcards: 89, color: "yellow" },
    { id: 7, name: "Computer Science Fundamentals", created: "2 weeks ago", flashcards: 76, color: "indigo" },
  ]);

  const handleCreateSession = () => {
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setStudySessionName("");
    setSelectedFiles([]);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleDeleteClick = (sessionId: number) => {
    setSessionToDelete(sessionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete !== null) {
      setStudySessions(prev => prev.filter(session => session.id !== sessionToDelete));
      setShowDeleteConfirm(false);
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
  };

  const handleDragStart = (e: React.DragEvent, sessionId: number) => {
    setDraggedItem(sessionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    // Clear all drag-related state when drag operation ends
    setDraggedItem(null);
    setDragOverItem(null);
    setInsertPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, sessionId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedItem === sessionId) return;

    // Get the bounds of the current element and mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    
    // Find indices
    const draggedIndex = draggedItem ? studySessions.findIndex(s => s.id === draggedItem) : -1;
    const currentIndex = studySessions.findIndex(s => s.id === sessionId);
    
    // Simple approach: use the element's vertical center as the dividing line
    const elementCenter = rect.top + rect.height / 2;
    
    if (mouseY < elementCenter) {
      // Mouse is in upper half - insert before this item
      // Don't allow dropping directly under the dragged item (before the item immediately after it)
      if (!(currentIndex === draggedIndex + 1)) {
        setDragOverItem(sessionId);
        setInsertPosition('before');
      }
    } else {
      // Mouse is in lower half - insert after this item
      // Don't allow dropping directly under the dragged item (after the dragged item itself)
      // Also don't allow dropping after the item immediately before the dragged item (which would put it above the dragged item)
      if (!(currentIndex === draggedIndex) && !(currentIndex === draggedIndex - 1)) {
        setDragOverItem(sessionId);
        setInsertPosition('after');
      }
    }
  };

  // Add a container-level drag over handler for gaps between elements
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Only handle gaps, let individual elements handle their own drag over
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-session-id')) {
      return; // Let the individual element handle this
    }
    
    // We're in a gap between elements
    const mouseY = e.clientY;
    const container = e.currentTarget as HTMLElement;
    const sessionElements = container.querySelectorAll('[data-session-id]');
    
    // Find the closest session element
    let closestElement: HTMLElement | null = null;
    let closestDistance = Infinity;
    let insertBefore = false;
    
    for (let i = 0; i < sessionElements.length; i++) {
      const element = sessionElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      // Check distance to top of element
      const distanceToTop = Math.abs(mouseY - rect.top);
      if (distanceToTop < closestDistance) {
        closestDistance = distanceToTop;
        closestElement = element;
        insertBefore = true;
      }
      
      // Check distance to bottom of element
      const distanceToBottom = Math.abs(mouseY - rect.bottom);
      if (distanceToBottom < closestDistance) {
        closestDistance = distanceToBottom;
        closestElement = element;
        insertBefore = false;
      }
    }
    
    if (closestElement) {
      const sessionId = parseInt(closestElement.getAttribute('data-session-id') || '0');
      setDragOverItem(sessionId);
      setInsertPosition(insertBefore ? 'before' : 'after');
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('Container drop triggered', { draggedItem, dragOverItem, insertPosition });
    
    // Use the same logic as the individual element drop handler
    if (draggedItem === null || dragOverItem === null || insertPosition === null) {
      console.log('Missing drag state in container drop, clearing...');
      setDraggedItem(null);
      setDragOverItem(null);
      setInsertPosition(null);
      return;
    }

    const draggedIndex = studySessions.findIndex(session => session.id === draggedItem);
    const targetIndex = studySessions.findIndex(session => session.id === dragOverItem);

    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('Invalid indices in container drop, clearing...');
      setDraggedItem(null);
      setDragOverItem(null);
      setInsertPosition(null);
      return;
    }

    console.log('Performing reorder in container', { draggedIndex, targetIndex, insertPosition });

    const newSessions = [...studySessions];
    const [draggedSession] = newSessions.splice(draggedIndex, 1);
    
    // Use the placeholder position that was calculated during drag over
    let insertIndex;
    if (insertPosition === 'before') {
      // Insert before the target item
      insertIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
    } else {
      // Insert after the target item
      insertIndex = targetIndex > draggedIndex ? targetIndex : targetIndex + 1;
    }
    
    console.log('Inserting at index in container', insertIndex);
    newSessions.splice(insertIndex, 0, draggedSession);

    setStudySessions(newSessions);
    setDraggedItem(null);
    setDragOverItem(null);
    setInsertPosition(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverItem(null);
      setInsertPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop triggered', { draggedItem, dragOverItem, insertPosition });
    
    if (draggedItem === null || dragOverItem === null || insertPosition === null) {
      console.log('Missing drag state, clearing...');
      setDraggedItem(null);
      setDragOverItem(null);
      setInsertPosition(null);
      return;
    }

    const draggedIndex = studySessions.findIndex(session => session.id === draggedItem);
    const targetIndex = studySessions.findIndex(session => session.id === dragOverItem);

    if (draggedIndex === -1 || targetIndex === -1) {
      console.log('Invalid indices, clearing...');
      setDraggedItem(null);
      setDragOverItem(null);
      setInsertPosition(null);
      return;
    }

    console.log('Performing reorder', { draggedIndex, targetIndex, insertPosition });

    const newSessions = [...studySessions];
    const [draggedSession] = newSessions.splice(draggedIndex, 1);
    
    // Use the placeholder position that was calculated during drag over
    let insertIndex;
    if (insertPosition === 'before') {
      // Insert before the target item
      insertIndex = targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
    } else {
      // Insert after the target item
      insertIndex = targetIndex > draggedIndex ? targetIndex : targetIndex + 1;
    }
    
    console.log('Inserting at index', insertIndex);
    newSessions.splice(insertIndex, 0, draggedSession);

    setStudySessions(newSessions);
    setDraggedItem(null);
    setDragOverItem(null);
    setInsertPosition(null);
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

  const handleFileUploadDrop = (e: React.DragEvent) => {
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
              <button 
                onClick={handleCreateSession}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Create New Session
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Study Sessions</h2>
              {/* Debug info */}
              {draggedItem && (
                <div className="text-sm text-cyan-400">
                  Dragging: {draggedItem} | Over: {dragOverItem} | Position: {insertPosition}
                </div>
              )}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isEditMode ? 'Done Editing' : 'Edit Sessions'}
              </button>
            </div>
            
            {/* Study Sessions Grid */}
            <div 
              className="space-y-4"
              onDragOver={handleContainerDragOver}
              onDrop={handleContainerDrop}
            >
              {studySessions.map((session) => {
                const currentIndex = studySessions.findIndex(s => s.id === session.id);
                const dragOverIndex = dragOverItem ? studySessions.findIndex(s => s.id === dragOverItem) : -1;
                
                // Determine if this item should shift down based on drag position
                // Exclude the position directly under the dragged item from being a valid drop zone
                const draggedIndex = draggedItem ? studySessions.findIndex(s => s.id === draggedItem) : -1;
                
                const shouldShiftDown = draggedItem !== null && dragOverItem !== null && 
                  draggedItem !== session.id && // Dragged item itself should never shift
                  (
                    // When inserting before an item, shift ALL items from that position onward (including the target)
                    // BUT don't allow dropping directly under the dragged item
                    (insertPosition === 'before' && currentIndex >= dragOverIndex && 
                      !(insertPosition === 'before' && dragOverIndex === draggedIndex + 1)) ||
                    // When inserting after an item, shift only items after the target item
                    // BUT don't allow dropping directly under the dragged item  
                    (insertPosition === 'after' && currentIndex > dragOverIndex &&
                      !(insertPosition === 'after' && dragOverIndex === draggedIndex))
                  );

                // The dragged item should maintain its original position while dragging
                const isDraggedItem = draggedItem === session.id;

                // Calculate the shift amount - minimal space for placeholder + normal spacing
                // Smooth shifting animation with tight spacing - just enough for placeholder
                const shiftAmount = (shouldShiftDown && !isDraggedItem) ? 'translate-y-0' : 'translate-y-0';

                return (
                  <div key={session.id}>
                    {/* Drop Placeholder - appears before item when inserting before */}
                    {dragOverItem === session.id && insertPosition === 'before' && draggedItem !== session.id && 
                     // Don't show placeholder directly under the dragged item OR directly above the dragged item
                     !(currentIndex === draggedIndex + 1) && !(currentIndex === draggedIndex) && (
                      <div className="bg-transparent border-2 border-dashed border-cyan-400 rounded-xl mb-4 p-4 transition-all duration-300 ease-out min-h-[120px] flex">
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-cyan-400 text-sm font-medium">Drop here</span>
                        </div>
                      </div>
                    )}
                    
                    <div 
                      data-session-id={session.id}
                      className={`bg-gray-700 bg-opacity-50 border border-gray-600 rounded-xl p-4 hover:bg-opacity-70 transition-all duration-300 ease-out relative ${
                        isEditMode ? 'cursor-move' : ''
                      } ${
                        draggedItem === session.id ? 'opacity-50 scale-95 transform' : ''
                      } ${
                        shiftAmount
                      } transform`}
                      draggable={isEditMode}
                      onDragStart={(e) => handleDragStart(e, session.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, session.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {isEditMode && (
                        <button
                          onClick={() => handleDeleteClick(session.id)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-400 p-1 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      <h3 className={`font-semibold text-white mb-2 transition-all duration-200 ${isEditMode ? 'pr-8' : ''}`}>
                        {session.name}
                      </h3>
                      <p className="text-sm text-gray-300 mb-3">Created {session.created}</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs bg-${session.color}-500 text-white px-3 py-1 rounded-full`}>
                          {session.flashcards} flashcards
                        </span>
                        {!isEditMode && (
                          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Study Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Drop Placeholder - appears after item when inserting after */}
                    {dragOverItem === session.id && insertPosition === 'after' && draggedItem !== session.id &&
                     // Don't show placeholder directly under the dragged item
                     !(currentIndex === draggedIndex) && (
                      <div className="bg-transparent border-2 border-dashed border-cyan-400 rounded-xl mt-4 p-4 transition-all duration-300 ease-out min-h-[120px] flex">
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-cyan-400 text-sm font-medium">Drop here</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Space for shifting animation at bottom */}
              {draggedItem !== null && (
                <div className="h-32 transition-all duration-300 ease-out"></div>
              )}
              
              {/* Add New Session Card - only show when not in edit mode */}
              {!isEditMode && (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simple Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                Delete Study Session
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                Are you sure you want to delete this study session?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                >
                  No
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  onDrop={handleFileUploadDrop}
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