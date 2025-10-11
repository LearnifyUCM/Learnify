import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black relative">
        {/* Background geometric shapes - global for all pages */}
        <div className="fixed inset-0 w-full h-full overflow-hidden">
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

        {/* Content layer */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navigation />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App
