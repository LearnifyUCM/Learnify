function About() {
  return (
    <div className="min-h-screen w-full relative">
      <div className="relative z-10 w-full px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-white text-center">
            About Learnify
          </h1>
          
          {/* Main Content */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700 mb-8">
            <p className="text-lg text-gray-300 mb-6">
              Learnify is an AI-powered study companion that transforms your PDF documents 
              into interactive flashcards, making learning more efficient and effective.
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Our advanced artificial intelligence analyzes your study materials, extracts 
              key concepts, and automatically generates personalized flashcards to help you 
              master any subject faster than ever before.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-white">
                AI-Powered Learning
              </h3>
              <p className="text-gray-300">
                Our AI analyzes your PDFs and creates smart flashcards that focus on the most important concepts.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-white">
                PDF to Flashcards
              </h3>
              <p className="text-gray-300">
                Simply upload any PDF and watch as it's automatically converted into study-ready flashcards.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-white">
                Progress Tracking
              </h3>
              <p className="text-gray-300">
                Monitor your learning progress and identify areas that need more focus.
              </p>
            </div>
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 text-white">
                Adaptive Study
              </h3>
              <p className="text-gray-300">
                Flashcards adapt to your learning pace, focusing on concepts you find challenging.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
            <h3 className="text-2xl font-semibold mb-6 text-white">
              How It Works
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-300 text-lg">
              <li>Upload your PDF study material</li>
              <li>AI analyzes and extracts key information</li>
              <li>Intelligent flashcards are automatically generated</li>
              <li>Start studying with personalized flashcard sets</li>
              <li>Track your progress and master the material</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;