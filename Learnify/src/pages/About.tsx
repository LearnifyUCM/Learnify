function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-12 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          About Learnify
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-lg text-gray-700 mb-6">
            Learnify is an AI-powered study companion that transforms your PDF documents 
            into interactive flashcards, making learning more efficient and effective.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Our advanced artificial intelligence analyzes your study materials, extracts 
            key concepts, and automatically generates personalized flashcards to help you 
            master any subject faster than ever before.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-800">
                🧠 AI-Powered Learning
              </h3>
              <p className="text-gray-700">
                Our AI analyzes your PDFs and creates smart flashcards that focus on the most important concepts.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-green-800">
                📄 PDF to Flashcards
              </h3>
              <p className="text-gray-700">
                Simply upload any PDF and watch as it's automatically converted into study-ready flashcards.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-purple-800">
                📊 Progress Tracking
              </h3>
              <p className="text-gray-700">
                Monitor your learning progress and identify areas that need more focus.
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-orange-800">
                🎯 Adaptive Study
              </h3>
              <p className="text-gray-700">
                Flashcards adapt to your learning pace, focusing on concepts you find challenging.
              </p>
            </div>
          </div>
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              How It Works
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
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