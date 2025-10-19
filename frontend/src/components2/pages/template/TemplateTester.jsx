// TemplateTester.jsx - For testing all templates
import React, { useState } from 'react';
import BentoTemplate from './Bento';
import GlassmorphismTemplate from './Glassmorphism';
import MinimalisticTemplate from './Minimalistic';
import { placeholderCreatorData, minimalCreatorData, generateRandomCreatorData } from'./ placeholderCreatorData';

export default function TemplateTester() {
  const [currentTemplate, setCurrentTemplate] = useState('bento');
  const [currentData, setCurrentData] = useState(placeholderCreatorData);

  const templates = {
    bento: BentoTemplate,
    glassmorphism: GlassmorphismTemplate,
    minimalistic: MinimalisticTemplate
  };

  const CurrentTemplate = templates[currentTemplate];

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
        <button 
          onClick={() => setCurrentTemplate('bento')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Bento
        </button>
        <button 
          onClick={() => setCurrentTemplate('glassmorphism')}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Glassmorphism
        </button>
        <button 
          onClick={() => setCurrentTemplate('minimalistic')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Minimalistic
        </button>
        
        <button 
          onClick={() => setCurrentData(placeholderCreatorData)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Full Data
        </button>
        <button 
          onClick={() => setCurrentData(minimalCreatorData)}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Minimal Data
        </button>
        <button 
          onClick={() => setCurrentData(generateRandomCreatorData(currentTemplate))}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Random Data
        </button>
      </div>

      <CurrentTemplate data={currentData} />
    </div>
  );
}