import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login, updateProfile } from '@/services/auth';
import { Input } from '@/components2/ui/input';
import { Button } from '@/components2/ui/button';
import { toast } from '@/components2/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components2/ui/dialog';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { api } from '@/services/api';
import { useAuth } from '@/components/auth/AuthProvider';
 
export default function LearnerSignUp() {
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

  const { refreshUser } = useAuth(); // ✅ Correct usage

  

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBasicChange = (e) =>
    setBasicForm({ ...basicForm, [e.target.name]: e.target.value });

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setProfileForm({ ...profileForm, image: e.target.files[0] });

  const handleBasicSubmit = async () => {
    try {
      await register({
        ...basicForm,
        role: 'student',
        school_id: 1,
      });
  
      const res = await login(basicForm.email, basicForm.password);
      localStorage.setItem('token', res.access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.access_token}`;
      await refreshUser(); // <<== Force context update here

      toast(
      'Signup successful!',
      {description: 'Welcome to the platform.',
      });
      
      setStep(2);
    } catch (err) {
      if (err.response?.status === 409) {
        toast(
           'Error',
           { description: 'An account with this email already exists.',
          
        });
      } else {
        toast(
           'Signup Failed',
           {description: 'Please try again.',
        });
      }
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

      toast(
         'Profile Saved',
         {description: 'Welcome to Estrateji!'
      });
      navigate('/learner/dashboard');
    } catch {
      toast(
         'Error',
         { description: 'Could not update your profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 1 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-100">
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join as a Learner
              </h1>
              <p className="text-gray-500 mt-2">Start your learning journey today</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  name="full_name"
                  placeholder="John Doe"
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              onClick={handleBasicSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md"
            >
              Continue
            </Button>
          </div>
        ) : (
          <Dialog open onOpenChange={() => setStep(1)}>
            <DialogContent className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Complete Your Profile
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Help us personalize your experience
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <Input
                    name="bio"
                    placeholder="Tell us about yourself..."
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select
                    name="language"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    onChange={handleProfileChange}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ht">Kreyòl Ayisyen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProfileSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Finish Setup'
                )}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}