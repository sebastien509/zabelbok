// ✅ LoginPage.jsx (Polished + Safe Navigate + Auth Connected)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // adjust path if needed
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = 'http://localhost:5050'; // Hardcoded API URL
      const res = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password,
      });
  
      const { access_token, role } = res.data;
      login(access_token, role);
  
      // Navigate based on the role
      if (role === 'admin') {
        navigate('/dashboard/admin'); // Redirect to Admin Dashboard
      } else if (role === 'professor') {
        navigate('/dashboard/professor'); // Redirect to Professor Dashboard
      } else if (role === 'student') {
        navigate('/dashboard/student'); // Redirect to Student Dashboard
      } else {
        navigate('/'); // Fallback for undefined roles
      }
  
    } catch (err) {
      setError('Invalid credentials or network error.');
    }
  };
  



    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-8"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">Sign in to your account</p>
          </div>
  
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </motion.div>
  
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </motion.div>
  
              <div className="flex items-center justify-between">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center"
                >
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </motion.div>
  
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </Link>
                </motion.div>
              </div>
  
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
  
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Sign In
              </motion.button>
            </form>
  
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-sm text-gray-500"
            >
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register now
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }