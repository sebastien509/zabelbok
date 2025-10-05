import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login, updateProfile } from '@/services/auth';
import { Input } from '@/components2/ui/input';
import { Button } from '@/components2/bento-UI/button';
import { toast } from '@/components2/bento-UI/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components2/bento-UI/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { useAuth } from '@/components/auth/AuthProvider';

import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';
import { motion, AnimatePresence } from 'framer-motion';

import { FaGoogle, FaCheckCircle } from "react-icons/fa";

// ── Brand colors
const brand = {
  apple: "#8DB600",
  heritage: "#C1272D",
  burnt: "#EE964B",
  ivory: "#FAF9F6",
  olive: "#3B3C36",
};

// Optional: background video fallback
const BG_VIDEO =
  "https://cdn.coverr.co/videos/coverr-sunrise-over-hills-9711/1080p.mp4";

// Tight soft shadow helper
const softShadow = (hex = brand.olive, a = 0.16) => {
  const c = hex.replace("#", "");
  const n = parseInt(c.length === 3 ? c.split("").map(x => x + x).join("") : c, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `0 8px 22px rgba(${r},${g},${b},${a})`;
};

function GoogleButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full flex items-center justify-center gap-3 rounded-lg border bg-white text-[#222] py-3 transition-all hover:bg-[#f7f7f7]"
      style={{ borderColor: "rgba(59,60,54,.15)", boxShadow: softShadow(brand.apple, 0.12) }}
    >
      <FaGoogle className="text-xl text-[#EA4335]" />
      Continue with Google
    </button>
  );
}

function ValueCard({ title, points = [], accent = brand.apple }) {
  return (
    <div
      className="rounded-xl p-4 bg-white/90 backdrop-blur border"
      style={{ borderColor: "rgba(59,60,54,.08)", boxShadow: softShadow(accent, 0.14) }}
    >
      <div className="text-sm font-semibold" style={{ color: accent }}>{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-[#3B3C36]">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <FaCheckCircle className="mt-[2px]" style={{ color: accent }} />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 
 * Feature hero panel (md+ only)
 * - Matches height of the form card via the same min-h
 * - Hidden on mobile
 * - Replace `HERO_IMG` with your brand image if desired
 */
const HERO_IMG = "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop";

function FeatureHeroMDUp() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="hidden md:block w-full max-w-xl md:self-stretch"
    >
      <div
        className="relative  bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(255,255,255,.25)", minHeight: "620px" }} // ⬅ match form card min height
      >
        <img
          src={HERO_IMG}
          alt="E-stratèji creators"
          className="absolute max-h-[400px] inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.15)_0%,rgba(0,0,0,.35)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-white/90 text-[#3B3C36]">
            Built for the Caribbean • Kreyòl & Patwa
          </div>
          <h3 className="mt-3 text-white text-2xl font-semibold">
            Launch faster. Earn more. Teach your way.
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ValueCard
              title="Creators keep more"
              accent={brand.apple}
              points={["Stripe Express payouts", "Transparent fees", "Own your brand"]}
            />
            <ValueCard
              title="Offline-friendly"
              accent={brand.burnt}
              points={["Low-data modules", "Mobile-first", "Captions & transcripts"]}
            />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

export default function CreatorSignUp() {
  const [step, setStep] = useState(1);
  const [basicForm, setBasicForm] = useState({ full_name: '', email: '', password: '' });
  const [profileForm, setProfileForm] = useState({ bio: '', language: 'en', image: null });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleBasicChange = (e) => setBasicForm({ ...basicForm, [e.target.name]: e.target.value });
  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProfileForm(prev => ({ ...prev, image: e.target.files[0] }));

  const handleOAuthSignup = async (provider = 'google') => {
    try {
      window.location.href = `/auth/${provider}`;
    } catch (err) {
      console.error('[OAuth Error]', err);
      toast({
        title: 'Google sign-in failed',
        description: 'Please try again or use email sign-up.',
        variant: 'destructive',
      });
    }
  };

  const handleBasicSubmit = async () => {
    try {
      await register({ ...basicForm, role: 'professor', school_id: 1 });
      const res = await login(basicForm.email, basicForm.password);

      localStorage.setItem('token', res.access_token);
      localStorage.setItem('user_id', res.user_id);
      await refreshUser();

      toast({ title: 'Signup successful!', description: 'Welcome to the platform.' });
      navigate('/creator/onboarding');
    } catch (err) {
      console.error('[Signup Error]', err);
      toast({
        title: 'Signup failed',
        description: 'That email might already be used or your network failed.',
        variant: 'destructive',
      });
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
        profile_image_url: imageUrl,
      });

      toast({ title: 'Profile updated', description: 'Welcome to Estrateji!' });
      navigate('/creator/dashboard');
    } catch (err) {
      console.error('[Profile Submit Error]', err);
      toast({
        title: 'Update failed',
        description: 'Could not save your profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative md:max-h-[800px] py-20  overflow-hidden bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(141,182,0,0.08),transparent_50%)]">
      {/* Background Video */}
      <video
        key="bg"
        className="absolute inset-0 w-full h-full object-cover opacity-10"
        autoPlay
        muted
        playsInline
        loop
      >
        <source src={BG_VIDEO} type="video/mp4" />
      </video>

      {/* Lottie layer */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Lottie animationData={bgAnimation} loop className="w-full h-full object-cover" />
      </div>

      {/* Close */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-26 right-8 md:top- md:right-12 text-white rotate-45 text-3xl z-50 hover:scale-125 hover:text-[#C1272D] shadow-lg transition-transform"
        aria-label="Close"
      >
        <motion.span whileHover={{ rotate: 90 }} className="block">+</motion.span>
      </button>

      {/* Layout */}
      <div className="relative  z-10 flex flex-col md:flex-row items-stretch justify-center min-h-[450px] gap-6 p-4 md:p-6">
        {/* Sign-up Card */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md  bg-white/92 backdrop-blur rounded-xl shadow-2xl overflow-hidden z-20 border md:self-stretch"
          style={{ borderColor: "rgba(59,60,54,.1)", minHeight: "620px" }} // ⬅ match panel height
        >
          <div className="p-4 bg-gradient-to-r from-[#8DB600] to-[#C1272D]">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-white">🎥 Creator Sign Up</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* MOBILE: Google first */}
            <div className="block md:hidden">
              <GoogleButton onClick={() => handleOAuthSignup('google')} />
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t" style={{ borderColor: "rgba(59,60,54,.12)" }} />
                <span className="mx-3 text-[#3B3C36]/60 text-sm">or</span>
                <div className="flex-grow border-t" style={{ borderColor: "rgba(59,60,54,.12)" }} />
              </div>
            </div>

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3B3C36] mb-2">Full Name</label>
                    <Input
                      name="full_name"
                      placeholder="John Doe"
                      onChange={handleBasicChange}
                      className="border-[#3B3C36]/20 focus:border-[#8DB600] focus:ring-[#8DB600]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3B3C36] mb-2">Email</label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      onChange={handleBasicChange}
                      className="border-[#3B3C36]/20 focus:border-[#8DB600] focus:ring-[#8DB600]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3B3C36] mb-2">Password</label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleBasicChange}
                      className="border-[#3B3C36]/20 focus:border-[#8DB600] focus:ring-[#8DB600]"
                    />
                  </div>

                  <Button
                    onClick={handleBasicSubmit}
                    className="w-full rounded-lg text-lg py-3 bg-[#000] hover:bg-[#000]/90 text-white"
                    style={{ boxShadow: softShadow(brand.apple, 0.22) }}
                  >
                    Continue
                  </Button>

                  {/* DESKTOP: Google under form (visible on md+) */}
                  <div className="hidden md:block ">
                    <div className="relative flex items-center py-4">
                      <div className="flex-grow border-t" style={{ borderColor: "rgba(59,60,54,.12)" }} />
                      <span className="mx-3 text-[#3B3C36]/60 text-sm">or</span>
                      <div className="flex-grow border-t" style={{ borderColor: "rgba(59,60,54,.12)" }} />
                    </div>
                    <GoogleButton onClick={() => handleOAuthSignup('google')} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* md+ FEATURE HERO (image) — hidden on mobile */}
        <FeatureHeroMDUp />

        {/* MOBILE: value cards below form */}
        {/* <div className="w-full max-w-md mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          <ValueCard
            title="Creators keep more"
            accent={brand.apple}
            points={["Payouts via Stripe Express", "Transparent platform fees", "No hidden costs"]}
          />
          <ValueCard
            title="Built for the Caribbean"
            accent={brand.burnt}
            points={["Offline-friendly modules", "Kreyòl & Patwa support", "Lightweight mobile apps"]}
          />
        </div> */}
      </div>

      {/* Step 2: Profile Dialog */}
      <AnimatePresence>
        {step === 2 && (
          <Dialog open={step === 2} onOpenChange={(o) => setStep(o ? 2 : 1)}>
            <DialogContent
              className="max-w-lg mx-auto bg-white/92 backdrop-blur-lg border rounded-xl overflow-hidden"
              style={{ borderColor: "rgba(59,60,54,.1)" }}
            >
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
                <div className="bg-gradient-to-r from-[#8DB600] to-[#C1272D] p-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Complete Your Creator Profile</DialogTitle>
                    <DialogDescription className="text-sm text-white/90">
                      Finish setting up your creator profile to begin publishing.
                    </DialogDescription>
                  </DialogHeader>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#3B3C36] mb-2">Short Bio</label>
                    <textarea
                      name="bio"
                      placeholder="Tell us about you..."
                      onChange={handleProfileChange}
                      className="w-full p-3 rounded-lg border border-[#3B3C36]/20 focus:outline-none focus:ring-2 focus:ring-[#8DB600] focus:border-transparent min-h=[120px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3B3C36] mb-2">Preferred Language</label>
                    <select
                      name="language"
                      className="w-full p-3 rounded-lg border border-[#3B3C36]/20 focus:outline-none focus:ring-2 focus:ring-[#8DB600] focus:border-transparent"
                      onChange={handleProfileChange}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ht">Kreyòl</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3B3C36] mb-2">Profile Image</label>
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-[#3B3C36]/30 rounded-lg p-4 hover:border-[#EE964B] transition-colors">
                        <p className="text-center text-sm text-[#3B3C36]/70">
                          {profileForm?.image ? profileForm.image.name : "Click to upload profile image"}
                        </p>
                      </div>
                      <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>

                  <Button
                    onClick={handleProfileSubmit}
                    disabled={loading}
                    className="w-full rounded-lg text-lg py-3 bg-[#8DB600] hover:bg-[#8DB600]/90 text-white"
                    style={{ boxShadow: softShadow(brand.apple, 0.22) }}
                  >
                    {loading ? "Saving..." : "Finish Sign Up"}
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
