import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog";
import { Button } from "@/components2/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components2/ui/card";
import { updateModuleTranscriptAndQuiz } from "@/services/modules";

export default function EditModuleModal({ module, onClose }) {
  const [transcript, setTranscript] = useState("");
  const [quiz, setQuiz] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTranscript(module?.transcript || "");
    setQuiz(module?.quiz || []);
  }, [module]);

  const handleAddQuestion = () => {
    setQuiz((prev) => [
      ...prev,
      { question_text: "", choices: ["", "", "", ""], correct_answer: "" },
    ]);
  };

  const handleRemoveQuestion = (index) => {
    setQuiz((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuizChange = (index, field, value) => {
    setQuiz((prev) => {
      const updated = [...prev];
      if (field === "question_text" || field === "correct_answer") {
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
      alert("Failed to update module.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: `rgba(var(--brand), 0.80)` }}
            />
            Edit Module: {module?.title}
          </DialogTitle>
          <DialogDescription>
            Video and title are fixed. You can update the transcript and quiz content.
          </DialogDescription>
        </DialogHeader>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Transcript */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📝 Transcript</span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: `rgba(var(--brand), 0.40)`,
                    color: `rgb(11 18 32)`,
                  }}
                >
                  Editable
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full rounded-lg border border-white/30 bg-white/50 p-3 text-sm outline-none backdrop-blur-md focus:ring-2 focus:ring-[rgba(var(--brand),0.6)]"
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Write or paste the transcript…"
              />
            </CardContent>
          </Card>

          {/* Quiz */}
          <Card className="lg:col-span-7">
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h3 className="text-base font-semibold">📘 Quiz Questions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="border-white/40 bg-white/60 backdrop-blur hover:bg-white/80"
              >
                ➕ Add Question
              </Button>
            </div>
            <CardContent className="space-y-4">
              {quiz.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/30 bg-white/40 p-6 text-sm text-neutral-600 backdrop-blur">
                  No questions yet. Click <strong>Add Question</strong> to get started.
                </div>
              )}

              {quiz.map((q, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/25 bg-white/55 p-4 backdrop-blur glass-shadow"
                >
                  <label className="mb-2 block text-sm font-medium">
                    Q{index + 1}
                  </label>

                  <input
                    type="text"
                    placeholder="Question text"
                    value={q.question_text}
                    onChange={(e) =>
                      handleQuizChange(index, "question_text", e.target.value)
                    }
                    className="mb-3 w-full rounded-md border border-white/30 bg-white/70 p-2 text-sm outline-none backdrop-blur focus:ring-2 focus:ring-[rgba(var(--brand),0.6)]"
                  />

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {q.choices.map((choice, cIdx) => (
                      <input
                        key={cIdx}
                        type="text"
                        placeholder={`Choice ${cIdx + 1}`}
                        value={choice}
                        onChange={(e) => handleChoiceChange(index, cIdx, e.target.value)}
                        className="w-full rounded-md border border-white/30 bg-white/70 p-2 text-sm outline-none backdrop-blur focus:ring-2 focus:ring-[rgba(var(--brand),0.6)]"
                      />
                    ))}
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Correct answer (e.g., the exact choice text or A/B/C/D)"
                      value={q.correct_answer}
                      onChange={(e) =>
                        handleQuizChange(index, "correct_answer", e.target.value)
                      }
                      className="w-full rounded-md border border-white/30 bg-white/70 p-2 text-sm outline-none backdrop-blur focus:ring-2 focus:ring-[rgba(var(--brand),0.6)]"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveQuestion(index)}
                      className="bg-red-500/80 text-white hover:bg-red-500"
                    >
                      🗑️ Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="hover:bg-white/60 backdrop-blur"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="text-white"
            style={{ backgroundColor: `rgba(var(--brand), 0.80)` }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
