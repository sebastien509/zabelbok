import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components2/bento-UI/button';
import { Input } from '@/components2/ui/input';
import { toast } from '@/components2/bento-UI/use-toast';
import { uploadToCloudinary } from '@/utils/uploadToCloudinary';
import { updateProfile, updateStyle } from '@/services/auth';
import { useAuth } from '@/components/auth/AuthProvider';



const PALETTES = ['color-1', 'color-2']; // top of file (or outside component)

// --- PLACEHOLDERS (swap with real screens later) ---
const THEME_CARDS = [
  {
    key: 'theme-1',
    title: 'Bento',
    cover: 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_bento.png',
    colors: {
      'color-1': 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_bento_c1.png',
      'color-2': 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_bento_c2.png',
    },
  },
  {
    key: 'theme-2',
    title: 'Minimalistic',
    cover: 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_minimal.png',
    colors: {
      'color-1': 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_minimal_c1.png',
      'color-2': 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_minimal_c2.png',
    },
  },
  {
    key: 'theme-3',
    title: 'Glassmorphism',
    cover: 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_glass.png',
    colors: {
      'color-1': 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_glass_c1.png',
      'color-2': 'https://res.cloudinary.com/demo/image/upload/v1720000000/placeholder_glass_c2.png',
    },
  },
];

const PRESET_BANNERS = [
  'https://res.cloudinary.com/demo/image/upload/v1720000000/preset_banner_1.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1720000000/preset_banner_2.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1720000000/preset_banner_3.jpg',
  'https://res.cloudinary.com/demo/image/upload/v1720000000/preset_banner_4.jpg',
];

const containerMotion = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const StepBadge = ({ index, active, done, label }) => (
  <div className="flex items-center gap-3">
    <div
      className={[
        'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold',
        active ? 'bg-[#EA7125] text-white shadow' : done ? 'bg-emerald-500 text-white' : 'bg-white/60 text-[#2C365E]',
        'border border-white/30 backdrop-blur',
      ].join(' ')}
    >
      {done ? '✓' : index}
    </div>
    <span className={`text-sm ${active ? 'text-white' : 'text-white/80'}`}>{label}</span>
  </div>
);

export default function CreatorOnboarding() {
  const [step, setStep] = useState(1);

  // profile
  const [bio, setBio] = useState('');
  const [language, setLanguage] = useState('en');
  const [avatar, setAvatar] = useState(null);

  // theme/palette
  const [theme, setTheme] = useState('theme-1'); // 'theme-1' | 'theme-2' | 'theme-3'
  const [paletteKey, setPaletteKey] = useState('color-1'); // 'color-1' | 'color-2'
  const [expandedTheme, setExpandedTheme] = useState('theme-1'); // which theme is currently expanded to show its colors

  // banner
  const [bannerUrl, setBannerUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    // If they already finished, you can auto-forward (optional)
    if (user?.bio && user?.theme && user?.banner_url) {
      // navigate('/creator/dashboard', { replace: true });
    }
  }, [user]);

  const paletteBoolean = useMemo(() => paletteKey === 'color-2', [paletteKey]); // BE expects boolean: false=color-1, true=color-2

  const next = () => setStep((s) => Math.min(6, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSaveProfile = async () => {
    setBusy(true);
    try {
      let profile_image_url = '';
      if (avatar) profile_image_url = await uploadToCloudinary(avatar);
      await updateProfile({ bio, language, profile_image_url });
      toast('Profile saved', { description: 'Nice bio—on to the fun parts!' });
      next();
    } catch (e) {
      toast.error('Could not save profile', { description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTheme = async () => {
    setBusy(true);
    try {
      await updateStyle({ theme, color: paletteBoolean });
      toast('Theme selected', { description: 'Palette options next.' });
      next();
    } catch {
      toast.error('Could not save theme', { description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleSavePalette = async () => {
    setBusy(true);
    try {
      await updateStyle({ theme, color: paletteBoolean });
      toast('Palette applied', { description: 'Looking sharp.' });
      next();
    } catch {
      toast.error('Could not apply palette', { description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveBanner = async () => {
    setBusy(true);
    try {
      await updateStyle({ theme, color: paletteBoolean, banner_url: bannerUrl });
      toast('Banner saved', { description: 'Preview time!' });
      next();
    } catch {
      toast.error('Could not save banner', { description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async () => {
    setBusy(true);
    try {
      await refreshUser();
      toast('All set!', { description: 'Your public page is live.' });
      navigate('/creator/dashboard', { replace: true });
    } catch {
      toast.error('Publish failed', { description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100svh]">
      {/* Gradient / motion backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C365E] via-[#3f4975] to-[#EA7125] opacity-90" />
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl"
          animate={{ y: [0, -15, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header + stepper */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold">Creator Onboarding</h1>
          <p className="text-white/80">Let’s set up your page in a few steps.</p>
        </div>

        <div className="grid md:grid-cols-6 grid-cols-2 gap-4 mb-8">
          <StepBadge index={1} label="Profile" active={step === 1} done={step > 1} />
          <StepBadge index={2} label="Template" active={step === 2} done={step > 2} />
          <StepBadge index={3} label="Palette" active={step === 3} done={step > 3} />
          <StepBadge index={4} label="Banner" active={step === 4} done={step > 4} />
          <StepBadge index={5} label="Preview" active={step === 5} done={step > 5} />
          <StepBadge index={6} label="Publish" active={step === 6} done={step > 6} />
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/30 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step-1" variants={containerMotion} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <h2 className="text-xl font-semibold text-[#2C365E]">Your Profile</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-[#2C365E]">Short Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell visitors who you are and what you publish…"
                      className="mt-2 w-full min-h-[110px] rounded-lg border border-[#2C365E]/20 p-3 focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2C365E]">Preferred Language</label>
                    <select
                      className="mt-2 w-full rounded-lg border border-[#2C365E]/20 p-3 focus:outline-none focus:ring-2 focus:ring-[#EA7125]"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ht">Kreyòl</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2C365E]">Profile Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={back} disabled>Back</Button>
                  <Button onClick={handleSaveProfile} disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" variants={containerMotion} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2C365E]">Pick a Template</h2>
                  <span className="text-sm text-[#2C365E]/70">Click a card to reveal its two color palettes.</span>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {THEME_CARDS.map((t) => {
                    const isExpanded = expandedTheme === t.key;
                    const isActive = theme === t.key;
                    return (
                      <motion.div
                        key={t.key}
                        layout
                        className={[
                          'rounded-xl border overflow-hidden bg-white shadow-sm',
                          isActive ? 'ring-2 ring-[#EA7125] border-transparent' : 'border-[#2C365E]/10',
                        ].join(' ')}
                      >
                        <button
                          className="w-full text-left"
                          onClick={() => {
                            setExpandedTheme(t.key);
                            setTheme(t.key);
                          }}
                        >
                          <img src={t.cover} alt={t.title} className="w-full h-44 object-cover" />
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-[#2C365E]">{t.title}</h3>
                              {isActive && <span className="text-xs bg-[#EA7125] text-white px-2 py-1 rounded">Selected</span>}
                            </div>
                            <p className="text-sm text-[#2C365E]/70 mt-1">Modern, responsive layout</p>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              key={`${t.key}-colors`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4"
                            >

<div className="grid grid-cols-2 gap-3">
  {PALETTES.map((pk) => (
    <button
      key={pk}
      onClick={() => {
        setTheme(t.key);
        setPaletteKey(pk);
      }}
      className={[
        'rounded-lg border overflow-hidden hover:shadow transition',
        theme === t.key && paletteKey === pk
          ? 'ring-2 ring-[#EA7125] border-transparent'
          : 'border-[#2C365E]/10',
      ].join(' ')}
    >
      <img
        src={t.colors[pk]}               // expects t.colors = { 'color-1': 'url', 'color-2': 'url' }
        alt={`${t.title}-${pk}`}
        className="w-full h-28 object-cover"
      />
      <div className="p-2 text-center text-xs text-[#2C365E]">{pk}</div>
    </button>
  ))}
</div>

                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handleSaveTheme} disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" variants={containerMotion} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2C365E]">Pick a Color Palette</h2>
                  <select
                    className="rounded-md border border-[#2C365E]/20 p-2 text-sm"
                    value={paletteKey}
                    onChange={(e) => setPaletteKey(e.target.value)}
                  >
                    <option value="color-1">color-1 (default)</option>
                    <option value="color-2">color-2</option>
                  </select>
                </div>

                {/* Show the 2 large previews for current theme */}
                <div className="grid md:grid-cols-2 gap-6">
                {['color-1', 'color-2'].map((pk) => {
                  const themeCard = THEME_CARDS.find((t) => t.key === theme);
                  if (!themeCard) return null;
                  return (
                    <button
                      key={pk}
                      onClick={() => setPaletteKey(pk)}
                      className={[
                        'rounded-xl border overflow-hidden bg-white',
                        paletteKey === pk ? 'ring-2 ring-[#EA7125] border-transparent shadow' : 'border-[#2C365E]/10',
                        'hover:shadow transition',
                      ].join(' ')}
                    >
                      <img src={themeCard.colors[pk]} alt={`${theme}-${pk}`} className="w-full h-56 object-cover" />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-[#2C365E]">{pk}</p>
                          {paletteKey === pk && <span className="text-xs bg-[#EA7125] text-white px-2 py-1 rounded">Selected</span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>


                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handleSavePalette} disabled={busy}>{busy ? 'Saving…' : 'Continue'}</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" variants={containerMotion} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <h2 className="text-xl font-semibold text-[#2C365E]">Banner</h2>
                <p className="text-sm text-[#2C365E]/70">Choose a preset or paste your image URL.</p>

                <div className="grid md:grid-cols-4 gap-4">
                  {PRESET_BANNERS.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setBannerUrl(src)}
                      className={[
                        'rounded-lg border overflow-hidden hover:shadow transition',
                        bannerUrl === src ? 'ring-2 ring-[#EA7125] border-transparent' : 'border-[#2C365E]/10',
                      ].join(' ')}
                    >
                      <img src={src} alt={`banner-${i}`} className="w-full h-28 object-cover" />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium text-[#2C365E]">Or paste a custom banner URL</label>
                  <Input
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://…"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handleSaveBanner} disabled={busy || !bannerUrl}>
                    {busy ? 'Saving…' : 'Continue'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step-5" variants={containerMotion} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <h2 className="text-xl font-semibold text-[#2C365E]">Preview</h2>
                <p className="text-sm text-[#2C365E]/70">This is a static mock. Your actual page will use real data.</p>

                {/* Simple preview frame */}
                <div className="rounded-xl overflow-hidden border border-[#2C365E]/10 shadow">
                  <div className="h-40 w-full" style={{ backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Avatar preview */}
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#EA7125] to-[#2C365E] opacity-70" />
                      <div>
                        <p className="font-semibold text-[#2C365E]">{user?.full_name || 'Your Name'}</p>
                        <p className="text-sm text-[#2C365E]/70">{language.toUpperCase()}</p>
                      </div>
                      <span className="ml-auto text-xs rounded px-2 py-1 bg-black/5 border border-black/10">
                        {theme} · {paletteKey}
                      </span>
                    </div>
                    <p className="mt-4 text-[#2C365E]">{bio || 'Your bio will appear here.'}</p>
                    <div className="mt-4">
                      <Button>Visit Public Page</Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={next}>Looks good</Button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="step-6" variants={containerMotion} initial="hidden" animate="show" exit="exit" className="space-y-6">
                <h2 className="text-xl font-semibold text-[#2C365E]">Publish</h2>
                <p className="text-sm text-[#2C365E]/70">We’ll finalize your page with the chosen template, palette, and banner.</p>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-emerald-800">
                    Ready to go live! You can always re-customize from your dashboard later.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={back}>Back</Button>
                  <Button onClick={handlePublish} disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
