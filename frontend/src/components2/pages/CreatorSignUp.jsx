import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login, updateProfile } from '@/services/auth';
import { Input } from '@/components2/ui/input';
import { Button } from '@/components2/bento-UI/button';
import { toast } from '@/components2/bento-UI/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components2/bento-UI/dialog';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';
import { motion, AnimatePresence } from 'framer-motion';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useAuth } from '@/components/auth/AuthProvider';

export default function CreatorSignUp() {
  const [step, setStep] = useState(1);
  const [basicForm, setBasicForm] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [profileForm, setProfileForm] = useState({
    bio: '',
    language: 'en',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBasicChange = (e) => setBasicForm({ ...basicForm, [e.target.name]: e.target.value });
  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProfileForm(prev => ({ ...prev, image: e.target.files[0] }));
  const { refreshUser } = useAuth(); // ✅ Correct usage


  const handleBasicSubmit = async () => {
    try {
      await register({ ...basicForm, role: 'professor', school_id: 1 });
      const res = await login(basicForm.email, basicForm.password);
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user_id', res.user_id);
      await refreshUser()

      toast('Signup successful!', {
        description: 'Welcome to the platform.',
      });

      setStep(2);
    } catch {
      toast.error('Signup Failed', { description: 'Email might already be used.' });
    }
  };

  const handleProfileSubmit = async () => {
    setLoading(true);
    try {
      let imageUrl = '';
      if (profileForm.image) {
        imageUrl = await uploadToCloudinary(profileForm.image);
      }
      await updateProfile({
        bio: profileForm.bio,
        language: profileForm.language,
        profile_image_url: imageUrl
      });
      toast.success('Profile Updated', { description: 'Welcome to Estrateji!' });
      navigate('/creator/dashboard');
    } catch (err) {
      console.error('[Profile Submit Error]', err);
      toast.error('Update Failed', { description: 'Could not save your profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FAF8F4] via-[#faf0e6] to-[#EA7125]/20">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Lottie 
          animationData={bgAnimation} 
          loop 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating gradient bubbles */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#EA7125]/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#2C365E]/10 blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-[#2C365E]/10"
        >
          <div className="bg-gradient-to-r from-[#2C365E] to-[#EA7125] p-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-white">🎥 Creator Sign Up</h1>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[#2C365E] mb-2">Full Name</label>
                  <Input 
                    name="full_name" 
                    placeholder="John Doe" 
                    onChange={handleBasicChange}
                    className="border-[#2C365E]/20 focus:border-[#EA7125] focus:ring-[#EA7125]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C365E] mb-2">Email</label>
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder="example@email.com" 
                    onChange={handleBasicChange}
                    className="border-[#2C365E]/20 focus:border-[#EA7125] focus:ring-[#EA7125]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C365E] mb-2">Password</label>
                  <Input 
                    name="password" 
                    type="password" 
                    placeholder="••••••••" 
                    onChange={handleBasicChange}
                    className="border-[#2C365E]/20 focus:border-[#EA7125] focus:ring-[#EA7125]"
                  />
                </div>
                <Button 
                  onClick={handleBasicSubmit} 
                  className="w-full rounded-lg text-lg py-3 bg-gradient-to-r from-[#EA7125] to-[#EA7125]/90 hover:from-[#EA7125]/90 hover:to-[#EA7125] transition-all shadow-md hover:shadow-lg"
                >
                  Continue
                </Button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {step === 2 && (
          <Dialog open={step === 2} onOpenChange={(open) => setStep(open ? 2 : 1)}>
            <DialogContent className="max-w-lg mx-auto bg-white/90 backdrop-blur-lg border border-[#2C365E]/10 rounded-xl overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-gradient-to-r from-[#2C365E] to-[#66A569] p-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Complete Your Creator Profile</DialogTitle>
                    <DialogDescription className="text-sm text-white/90">
                      Finish setting up your creator profile to begin publishing.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#2C365E] mb-2">Short Bio</label>
                    <textarea
                      name="bio"
                      placeholder="Tell us about you..."
                      onChange={handleProfileChange}
                      className="w-full p-3 rounded-lg border border-[#2C365E]/20 focus:outline-none focus:ring-2 focus:ring-[#EA7125] focus:border-transparent min-h-[120px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2C365E] mb-2">Preferred Language</label>
                    <select
                      name="language"
                      className="w-full p-3 rounded-lg border border-[#2C365E]/20 focus:outline-none focus:ring-2 focus:ring-[#EA7125] focus:border-transparent"
                      onChange={handleProfileChange}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ht">Kreyòl</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#2C365E] mb-2">Profile Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="border-2 border-dashed border-[#2C365E]/30 rounded-lg p-4 hover:border-[#EA7125] transition-colors">
                          <p className="text-center text-sm text-[#2C365E]/70">
                            {profileForm.image 
                              ? profileForm.image.name 
                              : "Click to upload profile image"}
                          </p>
                        </div>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleProfileSubmit} 
                    disabled={loading}
                    className="w-full rounded-lg text-lg py-3 bg-gradient-to-r from-[#66A569] to-[#66A569]/90 hover:from-[#66A569]/90 hover:to-[#66A569] transition-all shadow-md hover:shadow-lg mt-4"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Finish Sign Up'}
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}