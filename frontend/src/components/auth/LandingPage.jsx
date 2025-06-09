import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-8 sm:p-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md sm:max-w-2xl bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden border border-white/20 mx-2"
      >
        {/* Decorative elements - smaller on mobile */}
        <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-64 sm:h-64 sm:-top-20 sm:-right-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 sm:w-64 sm:h-64 sm:-bottom-20 sm:-left-20 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          {/* Logo - smaller on mobile */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </motion.div>
          
          {/* Title - adjusted font size for mobile */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 leading-tight"
          >
            HAITI - Edu Platform
          </motion.h1>
          
          {/* Subtitle - adjusted for mobile */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-gray-600 text-base sm:text-lg max-w-md sm:max-w-2xl mx-auto"
          >
            Empowering <span className="font-semibold text-blue-500">offline-first</span> education for Haitian students and educators.
          </motion.p>
          
          {/* Feature chips - adjusted spacing for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 px-2"
          >
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Offline Mode</span>
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Secure</span>
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Fast</span>
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Accessible</span>
          </motion.div>
          
          {/* Action buttons - full width with adjusted padding */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 sm:space-y-4 pt-4"
          >
            <Link to="/login">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 my-6 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-200 text-sm sm:text-base"
              >
                Login
              </motion.button>
            </Link>
            
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-white border-2 border-blue-100 hover:border-blue-200 text-gray-700 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                Create Account
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Footer note - adjusted text size */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-center text-gray-400 pt-3 sm:pt-4 px-2"
          >
            <p>Join thousands of educators and students transforming education in Haiti</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}