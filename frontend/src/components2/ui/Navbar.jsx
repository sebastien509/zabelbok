import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const reactLogo = "https://res.cloudinary.com/dyeomcmin/image/upload/v1752340909/Estrateji-Symbol-Green_pwdksv.png"

const Navbar = ({user, role}) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const dashboardLink = role === 'creator' ? '/creator-dashboard' : '/dashboard';


  
  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-blue/90 backdrop-blur-sm shadow-sm py-2" : "bg-white/20 backdrop-blur-sm py-3"}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-0">
          <img src={reactLogo} alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold bg-gradient-to-r from-lime-600 to-orange-400 pr-4 bg-clip-text text-transparent">
            STRATEJI
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/features" className="text-gray-700 hover:text-indigo-600 font-medium">
            Features
          </Link>
          <Link to="/creators" className="text-gray-700 hover:text-indigo-600 font-medium">
            For Creators
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-indigo-600 font-medium">
            Pricing
          </Link>

          <div className="flex items-center gap-4 ml-4">
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link to="/creator-signup" className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg">
                  Become a Creator
                </Link>
                <Link to="/start-learning" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-md">
                  Start Learning
                </Link>
              </>
            ) : (
              <Link to={dashboardLink} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2 text-gray-700" onClick={toggleMenu}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg p-4 space-y-4">
            <Link to="/features" onClick={toggleMenu} className="block text-gray-700 hover:text-indigo-600">
              Features
            </Link>
            <Link to="/creators" onClick={toggleMenu} className="block text-gray-700 hover:text-indigo-600">
              For Creators
            </Link>
            <Link to="/pricing" onClick={toggleMenu} className="block text-gray-700 hover:text-indigo-600">
              Pricing
            </Link>

            <div className="pt-4 space-y-3 border-t border-gray-100">
              {!user ? (
                <>
                  <Link to="/login" onClick={toggleMenu} className="block text-center text-gray-700 hover:text-indigo-600">
                    Login
                  </Link>
                  <Link to="/signup/creator" onClick={toggleMenu} className="block text-center border border-indigo-600 text-indigo-600 rounded-lg">
                    Become a Creator
                  </Link>
                  <Link to="signup/learner" onClick={toggleMenu} className="block text-center bg-indigo-600 text-white rounded-lg">
                    Start Learning
                  </Link>
                </>
              ) : (
                <Link to={dashboardLink} onClick={toggleMenu} className="block text-center bg-indigo-600 text-white rounded-lg">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar