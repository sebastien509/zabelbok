import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { createQuizWithQuestions } from '@/services/quizzes';
import { Loader2 } from 'lucide-react';

export default function QuizModal({ open, onClose, courseId }) {
  const [quiz, setQuiz] = useState({ 
    title: '', 
    description: '', 
    deadline: '' 
  });
  const [questions, setQuestions] = useState([{ 
    question_text: '', 
    choices: ['', '', '', ''], 
    correct_answer: '' 
  }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (i, key, value) => {
    const updated = [...questions];
    updated[i][key] = value;
    setQuestions(updated);
  };

  const handleChoiceChange = (qi, ci, value) => {
    const updated = [...questions];
    updated[qi].choices[ci] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      question_text: '', 
      choices: ['', '', '', ''], 
      correct_answer: '' 
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const validateQuiz = () => {
    if (!quiz.title || !courseId || !questions.length) {
      toast({
        title: 'Validation Error',
        description: 'Title, course, and at least one question are required',
        variant: 'destructive'
      });
      return false;
    }

    const isValid = questions.every(q => {
      const hasQuestionText = q.question_text.trim() !== '';
      const hasValidChoices = q.choices.every(choice => choice.trim() !== '');
      const hasValidAnswer = q.choices.includes(q.correct_answer);
      
      if (!hasQuestionText || !hasValidChoices || !hasValidAnswer) {
        toast({
          title: 'Validation Error',
          description: 'Each question must have text, all choices filled, and a correct answer matching one of the choices',
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateQuiz()) return;

    setIsSubmitting(true);
    try {
      const formattedQuestions = questions.map(q => ({
        question_text: q.question_text,
        choices: q.choices,
        correct_answer: q.choices.indexOf(q.correct_answer)
      }));

      await createQuizWithQuestions({ 
        ...quiz, 
        course_id: courseId, 
        questions: formattedQuestions 
      });

      toast({
        title: 'Success',
        description: 'Quiz created successfully',
        variant: 'default'
      });

      // Reset form
      setQuiz({ title: '', description: '', deadline: '' });
      setQuestions([{ question_text: '', choices: ['', '', '', ''], correct_answer: '' }]);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create quiz',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              name="title"
              placeholder="Quiz Title"
              value={quiz.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              name="description"
              placeholder="Description"
              value={quiz.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              name="deadline"
              type="datetime-local"
              value={quiz.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-4">
            <Label>Questions*</Label>
            {questions.map((q, i) => (
              <div key={i} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Question {i + 1}</Label>
                  {questions.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeQuestion(i)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <Input
                  placeholder="Question text"
                  value={q.question_text}
                  onChange={e => handleQuestionChange(i, 'question_text', e.target.value)}
                  required
                />

                <div className="space-y-2">
                  <Label>Choices*</Label>
                  {q.choices.map((choice, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <Input
                        placeholder={`Choice ${ci + 1}`}
                        value={choice}
                        onChange={e => handleChoiceChange(i, ci, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Correct Answer*</Label>
                  <select
                    value={q.correct_answer}
                    onChange={e => handleQuestionChange(i, 'correct_answer', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select correct answer</option>
                    {q.choices.map((choice, ci) => (
                      <option 
                        key={ci} 
                        value={choice}
                        disabled={!choice.trim()}
                      >
                        {choice || `Choice ${ci + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <Button 
              type="button" 
              variant="outline" 
              onClick={addQuestion}
            >
              + Add Question
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : 'Create Quiz'}
            </Button>
          </div>
        </div>
      </DialogContent>
  );
}