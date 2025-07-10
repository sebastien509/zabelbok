import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components2/ui/dialog';
import { Button } from '@/components2/ui/button';
import { updateModuleTranscriptAndQuiz } from '@/services/modules';

export default function EditModuleModal({ module, onClose }) {
  const [transcript, setTranscript] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTranscript(module.transcript || '');
    setQuiz(module.quiz || []);
  }, [module]);

  const handleAddQuestion = () => {
    setQuiz((prev) => [
      ...prev,
      {
        question_text: '',
        choices: ['', '', '', ''],
        correct_answer: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuiz((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuizChange = (index, field, value) => {
    setQuiz((prev) => {
      const updated = [...prev];
      if (field === 'question_text' || field === 'correct_answer') {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    setQuiz((prev) => {
      const updated = [...prev];
      updated[qIndex].choices[cIndex] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateModuleTranscriptAndQuiz(module.id, {
        transcript,
        quiz_questions: quiz,
      });
      onClose();
    } catch (err) {
      alert('Failed to update module.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Module: {module.title}</DialogTitle>
          <p className="text-sm text-gray-500">
            Video and title are fixed. You can only update the transcript and quiz content.
          </p>
        </DialogHeader>

        {/* Transcript */}
        <div className="mt-4">
          <label className="text-sm font-medium block mb-1">📝 Transcript</label>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={5}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
        </div>

        {/* Quiz */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">📘 Quiz Questions</label>
            <Button variant="outline" size="sm" onClick={handleAddQuestion}>
              ➕ Add Question
            </Button>
          </div>
          {quiz.map((q, index) => (
            <div key={index} className="border p-3 mb-4 rounded bg-white">
              <label className="text-sm block font-medium mb-1">
                Q{index + 1}
              </label>
              <input
                type="text"
                placeholder="Question text"
                value={q.question_text}
                onChange={(e) =>
                  handleQuizChange(index, 'question_text', e.target.value)
                }
                className="w-full border mb-2 p-2 text-sm"
              />
              {q.choices.map((choice, cIdx) => (
                <input
                  key={cIdx}
                  type="text"
                  placeholder={`Choice ${cIdx + 1}`}
                  value={choice}
                  onChange={(e) =>
                    handleChoiceChange(index, cIdx, e.target.value)
                  }
                  className="w-full border mb-1 p-2 text-sm"
                />
              ))}
              <input
                type="text"
                placeholder="Correct answer"
                value={q.correct_answer}
                onChange={(e) =>
                  handleQuizChange(index, 'correct_answer', e.target.value)
                }
                className="w-full border mb-2 p-2 text-sm"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveQuestion(index)}
              >
                🗑️ Remove Question
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
