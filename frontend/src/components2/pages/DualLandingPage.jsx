import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components2/ui/button';

export default function DualLandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f6f3f0] to-[#eef1f8] text-center px-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Haiti Knowledge Platform</h1>
      <p className="text-gray-600 mb-10 max-w-xl">
        Choose your path to knowledge and impact. This platform empowers both schools and independent creators to share, learn, and grow — even offline.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* School Pathway */}
        <div className="bg-white border rounded-lg shadow p-6 w-full md:w-80 text-left">
          <h2 className="text-xl font-semibold mb-2">🏫 For Schools & Students</h2>
          <p className="text-gray-500 mb-4 text-sm">
            Access your school dashboard, offline content, and track student progress.
          </p>
          <Button onClick={() => navigate('/amaider')} className="w-full">
            Enter School Platform
          </Button>
        </div>

        {/* Creator Pathway */}
        <div className="bg-white border rounded-lg shadow p-6 w-full md:w-80 text-left">
          <h2 className="text-xl font-semibold mb-2">🎥 For Creators & Self-Learners</h2>
          <p className="text-gray-500 mb-4 text-sm">
            Teach or learn through offline-ready video modules, AI transcripts, and more.
          </p>
          <Button onClick={() => navigate('/')} className="w-full" variant="secondary">
            Explore E-strateji
          </Button>
        </div>
      </div>
    </div>
  );
}
