import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Input } from '@/components2/ui/input';
import { Button } from '@/components2/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components2/ui/use-toast';


export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const isEstratejiSchool = user.school_id === 1;
      const isCreator = isEstratejiSchool && user.role === 'professor';
      const isLearner = isEstratejiSchool && user.role === 'student';

      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (isCreator) navigate('/creator/dashboard');
      else if (isLearner) navigate('/learner/dashboard');
      else if (user.role === 'professor') navigate('/dashboard/professor');
      else if (user.role === 'student') navigate('/dashboard/student');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token } = res.data;
  
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  
      const meRes = await api.get('/auth/me');
      const user = {
        ...meRes.data,
        token: access_token,
      };
  
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user); // ✅ context-aware user
  
  // After setting user
setUser(user);

// Determine final adjusted role and route
const isEstratejiSchool = user.school_id === 1;
const isCreator = isEstratejiSchool && user.role === 'professor';
const isLearner = isEstratejiSchool && user.role === 'student';

if (user.role === 'admin') navigate('/dashboard/admin');
else if (isCreator) navigate('/creator/dashboard');
else if (isLearner) navigate('/learner/dashboard');
else if (user.role === 'professor') navigate('/dashboard/professor');
else if (user.role === 'student') navigate('/dashboard/student');
else navigate('/');

    }
      catch (err) {
        console.error('Login failed:', err);
        toast('Login Failed', {
          description: 'Invalid credentials or server error.',
          variant: 'destructive',
        });
      
      
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-coconut p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-xl p-8 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center text-indigo-600">
            Welcome Back
          </h2>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-2">
            Need an account?{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
