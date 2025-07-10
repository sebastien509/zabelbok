// components2/ReviewTranscriptModal.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components2/ui/dialog';

export default function ReviewTranscriptModal({ transcript, open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Review Transcript</DialogTitle>
        </DialogHeader>
        <pre className="whitespace-pre-wrap text-sm text-gray-800 mt-2">
          {transcript || 'No transcript available.'}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
