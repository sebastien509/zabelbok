import React, { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components2/ui/dialog"
import { Button } from "@/components2/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components2/ui/card"
import { updateModuleTranscriptAndQuiz } from "@/services/modules"
import { getQuiz, updateQuiz } from "@/services/quizzes"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

const normalizeQuestions = (questions) => {
  if (!Array.isArray(questions)) return []
  return questions.map((q) => ({
    id: q?.id,
    question_text: q?.question_text || "",
    choices: Array.isArray(q?.choices) ? [...q.choices] : ["", "", "", ""],
    correct_answer: q?.correct_answer || "",
  }))
}

export default function EditModuleModal({ module, onClose }) {
  const [tab, setTab] = useState("transcript") // "transcript" | "quiz"

  // transcript state
  const [transcript, setTranscript] = useState("")
  const [savingTranscript, setSavingTranscript] = useState(false)

  // quiz state (from real quiz API)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizSaving, setQuizSaving] = useState(false)
  const [quizId, setQuizId] = useState(null)
  const [quizMeta, setQuizMeta] = useState({ title: "", description: "" })
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizLoadError, setQuizLoadError] = useState("")

  const moduleTitle = useMemo(() => module?.title || "Untitled", [module?.title])

  // Try to resolve quiz_id from various shapes
  const resolvedQuizId = useMemo(() => {
    const id =
      module?.quiz_id ||
      module?.quizId ||
      module?.quiz?.id ||
      module?.quiz?.quiz_id ||
      null
    return id ? Number(id) : null
  }, [module])

  useEffect(() => {
    setTranscript(module?.transcript || "")
    setTab("transcript")
    setQuizId(resolvedQuizId)
    setQuizMeta({ title: "", description: "" })
    setQuizQuestions([])
    setQuizLoadError("")
  }, [module, resolvedQuizId])

  // Load quiz only when user opens Quiz tab
  useEffect(() => {
    if (tab !== "quiz") return
    if (!quizId) {
      setQuizLoadError("No quiz linked to this module yet.")
      return
    }

    let cancelled = false
    const load = async () => {
      setQuizLoading(true)
      setQuizLoadError("")
      try {
        const res = await getQuiz(quizId)
        const data = res?.data || res
        if (cancelled) return

        setQuizMeta({
          title: data?.title || "",
          description: data?.description || "",
        })
        setQuizQuestions(normalizeQuestions(data?.questions))
      } catch (e) {
        if (cancelled) return
        setQuizLoadError("Failed to load quiz. Check permissions + route.")
      } finally {
        if (!cancelled) setQuizLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [tab, quizId])

  // ---------------------------
  // Transcript save (module API)
  // ---------------------------
  const saveTranscript = async () => {
    if (!module?.id) return
    setSavingTranscript(true)
    try {
      // ✅ Transcript-only update (quiz hidden by default)
      await updateModuleTranscriptAndQuiz(module.id, { transcript })
      onClose()
    } catch (err) {
      alert("Failed to update transcript.")
    } finally {
      setSavingTranscript(false)
    }
  }

  // ---------------------------
  // Quiz editing helpers
  // ---------------------------
  const addQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      { question_text: "", choices: ["", "", "", ""], correct_answer: "" },
    ])
  }

  const removeQuestion = (index) => {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const updateQuestionField = (index, field, value) => {
    setQuizQuestions((prev) => {
      const next = [...prev]
      if (!next[index]) return prev
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const updateChoice = (qIndex, cIndex, value) => {
    setQuizQuestions((prev) => {
      const next = [...prev]
      if (!next[qIndex]) return prev
      const choices = Array.isArray(next[qIndex].choices)
        ? [...next[qIndex].choices]
        : ["", "", "", ""]
      choices[cIndex] = value
      next[qIndex] = { ...next[qIndex], choices }
      return next
    })
  }

  const saveQuiz = async () => {
    if (!quizId) return
    setQuizSaving(true)
    try {
      // ✅ matches your backend PUT /quizzes/<id> expecting: { title, description, questions: [...] }
      await updateQuiz(quizId, {
        title: quizMeta.title || undefined,
        description: quizMeta.description || undefined,
        questions: quizQuestions.map((q) => ({
          question_text: q.question_text,
          choices: q.choices,
          correct_answer: q.correct_answer,
        })),
      })
      onClose()
    } catch (err) {
      alert("Failed to update quiz.")
    } finally {
      setQuizSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-6xl h-[92svh] p-0 overflow-hidden">
        {/* Sticky header with tabs */}
        <div className="sticky top-0 z-20 bg-white/75 backdrop-blur-xl border-b border-white/15 px-5 sm:px-6 py-5">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full shadow-[0_0_0_4px_rgba(var(--brand),0.15)]"
                    style={{ backgroundColor: `rgba(var(--brand), 0.85)` }}
                  />
                  <span className="font-bold text-[#2C365E] truncate">
                    Edit Module: {moduleTitle}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-[#2C365E]/70 mt-1">
                  Update transcript first. Quiz edits are in a separate tab.
                </DialogDescription>
              </div>

              {/* Tabs */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => setTab("transcript")}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold border transition",
                    tab === "transcript"
                      ? "bg-[#2C365E]/10 text-[#2C365E] border-[#2C365E]/15"
                      : "bg-white/70 text-[#2C365E]/80 border-white/25 hover:bg-white"
                  )}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setTab("quiz")}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold border transition",
                    tab === "quiz"
                      ? "bg-[rgba(var(--brand),0.12)] text-[#2C365E] border-[rgba(var(--brand),0.22)]"
                      : "bg-white/70 text-[#2C365E]/80 border-white/25 hover:bg-white"
                  )}
                >
                  Quiz
                </button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="h-[calc(92svh-92px)] min-h-0 bg-white/45 backdrop-blur-xl px-5 sm:px-6 py-4">
          {tab === "transcript" ? (
            <Card className="h-full min-h-0 border-white/15 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[#2C365E]">
                    <span className="text-base">📝</span>
                    Transcript
                  </span>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold border border-white/20"
                    style={{
                      backgroundColor: `rgba(var(--brand), 0.18)`,
                      color: `rgb(11 18 32)`,
                    }}
                  >
                    Editable
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0">
                <textarea
                  className="w-full h-full min-h-[64vh] rounded-2xl border border-white/20 bg-white/70 p-4 text-sm outline-none backdrop-blur-md shadow-sm
                  focus:ring-4 focus:ring-[rgba(var(--brand),0.18)] focus:border-[rgba(var(--brand),0.35)]
                  resize-none leading-relaxed"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Write or paste the transcript…"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full min-h-0 border-white/15 bg-white/60 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-[#2C365E]">
                    <span className="text-base">📘</span> Quiz
                    {quizId ? (
                      <span className="text-xs font-semibold text-[#2C365E]/60">
                        (ID: {quizId})
                      </span>
                    ) : null}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                    className="rounded-xl border-white/25 bg-white/70 backdrop-blur hover:bg-white/85"
                    disabled={!quizId || quizLoading}
                  >
                    ➕ Add Question
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0">
                {quizLoading ? (
                  <div className="h-full flex items-center justify-center text-sm text-[#2C365E]/70">
                    Loading quiz...
                  </div>
                ) : quizLoadError ? (
                  <div className="rounded-2xl border border-dashed border-white/25 bg-white/50 p-6 text-sm text-[#2C365E]/80">
                    {quizLoadError}
                    <div className="text-xs text-[#2C365E]/60 mt-2">
                      If this module should have a quiz, make sure it has <strong>quiz_id</strong>.
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-0 overflow-y-auto pr-1 space-y-4">
                    {/* Quiz meta */}
                    <div className="rounded-2xl border border-white/18 bg-white/70 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-[#2C365E]/70">
                            Quiz Title
                          </label>
                          <input
                            value={quizMeta.title}
                            onChange={(e) =>
                              setQuizMeta((p) => ({ ...p, title: e.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-white/20 bg-white/80 p-2.5 text-sm outline-none
                            focus:ring-4 focus:ring-[rgba(var(--brand),0.16)] focus:border-[rgba(var(--brand),0.35)]"
                            placeholder="Quiz title"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#2C365E]/70">
                            Quiz Description
                          </label>
                          <input
                            value={quizMeta.description}
                            onChange={(e) =>
                              setQuizMeta((p) => ({ ...p, description: e.target.value }))
                            }
                            className="mt-1 w-full rounded-xl border border-white/20 bg-white/80 p-2.5 text-sm outline-none
                            focus:ring-4 focus:ring-[rgba(var(--brand),0.16)] focus:border-[rgba(var(--brand),0.35)]"
                            placeholder="Short description"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    {quizQuestions.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/25 bg-white/50 p-6 text-sm text-neutral-700">
                        No questions yet. Click <strong>Add Question</strong>.
                      </div>
                    ) : null}

                    {quizQuestions.map((q, index) => (
                      <div
                        key={q.id || index}
                        className="rounded-2xl border border-white/18 bg-white/70 p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-[#2C365E]">
                            Q{index + 1}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeQuestion(index)}
                            className="rounded-xl bg-red-500/85 text-white hover:bg-red-500"
                          >
                            🗑️ Remove
                          </Button>
                        </div>

                        <input
                          type="text"
                          placeholder="Question text"
                          value={q.question_text}
                          onChange={(e) =>
                            updateQuestionField(index, "question_text", e.target.value)
                          }
                          className="mb-3 w-full rounded-xl border border-white/20 bg-white/80 p-2.5 text-sm outline-none
                          focus:ring-4 focus:ring-[rgba(var(--brand),0.16)] focus:border-[rgba(var(--brand),0.35)]"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(q.choices || ["", "", "", ""]).map((choice, cIdx) => (
                            <input
                              key={cIdx}
                              type="text"
                              placeholder={`Choice ${cIdx + 1}`}
                              value={choice}
                              onChange={(e) => updateChoice(index, cIdx, e.target.value)}
                              className="w-full rounded-xl border border-white/20 bg-white/80 p-2.5 text-sm outline-none
                              focus:ring-4 focus:ring-[rgba(var(--brand),0.16)] focus:border-[rgba(var(--brand),0.35)]"
                            />
                          ))}
                        </div>

                        <div className="mt-3">
                          <input
                            type="text"
                            placeholder="Correct answer (exact choice text or A/B/C/D)"
                            value={q.correct_answer}
                            onChange={(e) =>
                              updateQuestionField(index, "correct_answer", e.target.value)
                            }
                            className="w-full rounded-xl border border-white/20 bg-white/80 p-2.5 text-sm outline-none
                            focus:ring-4 focus:ring-[rgba(var(--brand),0.16)] focus:border-[rgba(var(--brand),0.35)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sticky footer: Save depends on tab */}
        <div className="sticky bottom-0 z-20 bg-white/75 backdrop-blur-xl border-t border-white/15 px-5 sm:px-6 py-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-white/25 bg-white/70 backdrop-blur hover:bg-white/85"
          >
            Cancel
          </Button>

          {tab === "transcript" ? (
            <Button
              onClick={saveTranscript}
              disabled={savingTranscript}
              className="rounded-xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
              style={{ backgroundColor: `rgba(var(--brand), 0.85)` }}
            >
              {savingTranscript ? "Saving..." : "Save Transcript"}
            </Button>
          ) : (
            <Button
              onClick={saveQuiz}
              disabled={quizSaving || quizLoading || !quizId}
              className="rounded-xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]"
              style={{ backgroundColor: `rgba(var(--brand), 0.85)` }}
            >
              {quizSaving ? "Saving..." : "Save Quiz"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
