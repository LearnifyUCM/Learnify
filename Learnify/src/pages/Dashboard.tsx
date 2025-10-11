function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-12 bg-gray-50">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Study Dashboard
        </h1>
        
        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Stacked Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recent Flashcard Sets */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                📚 Recent Flashcard Sets
              </h3>
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600">45 flashcards • Created 2 hours ago</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-gray-600">23 flashcards • Created 1 day ago</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-gray-600">67 flashcards • Created 3 days ago</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                ⚡ Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full !bg-indigo-600 hover:!bg-indigo-700 !text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2">
                  📄 Upload New PDF
                </button>
                <button className="w-full !bg-indigo-600 hover:!bg-indigo-700 !text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2">
                  🎯 Start Study Session
                </button>
                <button className="w-full !bg-indigo-600 hover:!bg-indigo-700 !text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2">
                  📈 View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Scrollable Study Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Created Study Sessions
              </h2>
              
              {/* Scrollable Container */}
              <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">Biology Chapter 12</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 2 hours ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">45 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">Physics Formulas</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 1 day ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">23 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">History Notes</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 3 days ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">67 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">Math Equations</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 5 days ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">34 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">Chemistry Basics</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 1 week ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">52 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">Spanish Vocabulary</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 1 week ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">89 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-800 mb-2">Computer Science Fundamentals</h3>
                  <p className="text-sm text-gray-600 mb-3">Created 2 weeks ago</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">76 flashcards</span>
                    <button className="!bg-indigo-600 hover:!bg-indigo-700 !text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                      Study Now
                    </button>
                  </div>
                </div>
                
                {/* Add New Session Card */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-gray-600 text-sm font-medium">Create New Session</span>
                </div>
              </div>
            </div>

            {/* AI Study Insights */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                🤖 AI Study Insights
              </h3>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Study Recommendation</h4>
                  <p className="text-sm text-blue-700">Based on your recent activity, consider reviewing Biology Chapter 12 - you've studied it recently and retention is optimal now.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Learning Pattern</h4>
                  <p className="text-sm text-green-700">Your study streak shows consistent progress! You tend to perform better with shorter, frequent sessions.</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">Focus Areas</h4>
                  <p className="text-sm text-purple-700">Science subjects show 85% mastery rate. Consider spending more time on Math Equations for balanced learning.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;