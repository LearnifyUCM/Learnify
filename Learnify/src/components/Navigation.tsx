import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700 w-full">
      <div className="w-full px-6 lg:px-12">
        <div className="flex justify-between items-center h-16 w-full">
          <Link to="/" className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
            Learnify
          </Link>
          
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-cyan-400 bg-cyan-400/20'
                    : 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;