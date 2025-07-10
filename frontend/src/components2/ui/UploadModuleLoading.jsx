import { Loader2, CheckCircle, FileText, ClipboardList, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UploadModuleLoading({ currentStep = 'uploading' }) {
  const steps = [
    {
      id: 'uploading',
      label: 'Uploading Video',
      icon: <UploadCloud className="h-5 w-5" />,
      description: 'Sending your video to our servers'
    },
    {
      id: 'transcribing',
      label: 'Generating Transcript',
      icon: <FileText className="h-5 w-5" />,
      description: 'Creating text captions from your video'
    },
    {
      id: 'quiz',
      label: 'Creating Quiz',
      icon: <ClipboardList className="h-5 w-5" />,
      description: 'Generating assessment questions'
    },
    {
      id: 'complete',
      label: 'Processing Complete',
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Finalizing your module'
    },
    {
      id: 'publishing',
      label: 'Publishing Module',
      icon: <Loader2 className="h-5 w-5 animate-spin" />,
      description: 'Making your module available to students'
    }
  ];

  return (
    <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="space-y-6">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-start p-3 rounded-lg transition-all ${
              currentStep === step.id ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            <div className="mr-3 mt-0.5">
              {currentStep === step.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : (
                step.icon
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{step.label}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}