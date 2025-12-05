
import React, { useState } from 'react';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onCartOpen: () => void;
  onAuthOpen?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartOpen, onAuthOpen }) => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/98 backdrop-blur-md z-50 border-b border-gray-100/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div
                className="flex items-center cursor-pointer hover:opacity-80 transition-opacity group"
                onClick={() => handleNavigation('/')}
              >
                <img
                  src="/logos/logo-vector.png"
                  alt="Prime Couture Logo"
                  className="w-10 h-10 object-contain mr-3 group-hover:scale-105 transition-transform duration-300"
                />
                <h1 className="text-sm md:text-xl font-light tracking-wider text-black">
                  PRIME COUTURE
                </h1>
              </div>
              {user && (
                <div className="ml-4 text-xs md:text-sm text-gray-600">
                  {user.name} — {user.role}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12">
              <button
                onClick={() => handleNavigation('/suits')}
                className="text-gray-700 hover:text-black transition-colors font-light tracking-wide text-sm uppercase relative group"
              >
                Suits
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => handleNavigation('/shirts')}
                className="text-gray-700 hover:text-black transition-colors font-light tracking-wide text-sm uppercase relative group"
              >
                Shirts
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => handleNavigation('/accessories')}
                className="text-gray-700 hover:text-black transition-colors font-light tracking-wide text-sm uppercase relative group"
              >
                Accessories
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => handleNavigation('/collections')}
                className="text-gray-700 hover:text-black transition-colors font-light tracking-wide text-sm uppercase relative group"
              >
                Collections
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>

            {/* Right Icons - Updated user icon with auth functionality */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="p-3 hover:bg-gray-50 rounded-full transition-all duration-300 hover:scale-105"
                aria-label="Sign in"
              >
                <User size={18} className="text-gray-700" />
              </button>
              <button
                onClick={onCartOpen}
                className="p-3 hover:bg-gray-50 rounded-full transition-all duration-300 relative hover:scale-105"
              >
                <ShoppingBag size={18} className="text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 hover:bg-gray-50 rounded-full transition-all duration-300"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-6 px-3 border-t border-gray-100/50 bg-white/95 backdrop-blur-sm">
              <nav className="flex flex-col space-y-4">
                <button
                  onClick={() => handleNavigation('/suits')}
                  className="text-gray-700 hover:text-black transition-colors font-light text-left tracking-wide uppercase"
                >
                  Suits
                </button>
                <button
                  onClick={() => handleNavigation('/shirts')}
                  className="text-gray-700 hover:text-black transition-colors font-light text-left tracking-wide uppercase"
                >
                  Shirts
                </button>
                <button
                  onClick={() => handleNavigation('/accessories')}
                  className="text-gray-700 hover:text-black transition-colors font-light text-left tracking-wide uppercase"
                >
                  Accessories
                </button>
                <button
                  onClick={() => handleNavigation('/collections')}
                  className="text-gray-700 hover:text-black transition-colors font-light text-left tracking-wide uppercase"
                >
                  Collections
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
};

export default Header;
