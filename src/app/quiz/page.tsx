"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ZoomableImage } from '@/components/ui/ZoomableImage';
import { Button } from '@/components/ui/Button';
import { Flag, Loader2, IterationCcw } from 'lucide-react';
import { fetchRandomQuestionAction } from '@/app/actions';
import type { Question } from '@/lib/queries';

function QuizContent() {
  const searchParams = useSearchParams();
  const topicsParam = searchParams.get('topics');
  const topics = topicsParam ? topicsParam.split(',').map(decodeURIComponent) : [];

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isFlagging, setIsFlagging] = useState(false);
  const [hasFlagged, setHasFlagged] = useState(false);
  
  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setQuestion(null);
    setUserAnswer('');
    setIsCorrect(null);
    setHasFlagged(false);
    try {
      const q = await fetchRandomQuestionAction(topics);
      setQuestion(q);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [topics]);

  useEffect(() => {
    if (topics.length > 0) {
      loadQuestion();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMCQSelect = (option: string) => {
    if (isCorrect !== null) return;
    setUserAnswer(option);
    setIsCorrect(option === question?.correct_answer);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCorrect !== null || !question) return;
    
    // Basic case-insensitive comparison
    const normalizedUser = userAnswer.trim().toLowerCase();
    const normalizedCorrect = question.correct_answer.trim().toLowerCase();
    setIsCorrect(normalizedUser === normalizedCorrect);
  };

  const handleFlag = async () => {
    if (!question || hasFlagged) return;
    setIsFlagging(true);
    try {
      const res = await fetch('/api/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id })
      });
      if (res.ok) setHasFlagged(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFlagging(false);
    }
  };

  if (topics.length === 0) {
    return <div className="text-center py-20 text-gray-500">No topics selected. Go back and select topics.</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Loading next question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">No Questions Found</h2>
        <p className="text-gray-600">We couldn&apos;t find any active questions for the selected topics.</p>
        <Button onClick={loadQuestion} variant="outline" className="gap-2">
          <IterationCcw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left: Image Viewer */}
      <div className="space-y-4">
        <ZoomableImage src={question.image_url} alt="Histology slide" />
        
        <div className="flex justify-between items-center px-2 text-sm text-gray-500">
          <span>Topic: <span className="font-semibold text-gray-700">{question.topic}</span></span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleFlag} 
            disabled={isFlagging || hasFlagged}
            className={hasFlagged ? 'text-red-600 bg-red-50' : 'text-gray-500 hover:text-red-600'}
          >
            <Flag className="h-4 w-4 mr-2" />
            {hasFlagged ? 'Reported' : 'Report Error'}
          </Button>
        </div>
      </div>

      {/* Right: Interaction */}
      <div className="bg-white p-6 sm:p-8 rounded-xl ring-1 ring-gray-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Identify the structure</h2>
          <p className="text-gray-600 text-sm">
            {question.question_type === 'MCQ' 
              ? 'Select the correct option from the list below.'
              : 'Enter the name of the highlighted/shown structure.'}
          </p>
        </div>

        {/* Question Type: MCQ */}
        {question.question_type === 'MCQ' && question.options && (
          <div className="space-y-3">
            {[...question.options, question.correct_answer]
              .sort() // Simple naive shuffle/sort for display purposes
              .filter((val, idx, arr) => arr.indexOf(val) === idx) // ensure uniqueness just in case
              .map((option, idx) => {
                const isSelected = userAnswer === option;
                const isActuallyCorrect = option === question.correct_answer;
                
                let btnVariant: 'outline' | 'danger' | 'success' | 'secondary' = 'outline';
                if (isCorrect !== null) {
                  if (isActuallyCorrect) btnVariant = 'success';
                  else if (isSelected && !isActuallyCorrect) btnVariant = 'danger';
                  else btnVariant = 'secondary';
                }

                return (
                  <Button
                    key={idx}
                    variant={btnVariant}
                    className={`w-full justify-start text-left h-auto py-3 px-4 min-h-[3rem] ${
                      isCorrect !== null && !isActuallyCorrect && !isSelected ? 'opacity-50' : ''
                    }`}
                    onClick={() => handleMCQSelect(option)}
                    disabled={isCorrect !== null}
                  >
                    {option}
                  </Button>
                );
              })}
          </div>
        )}

        {/* Question Type: Recognition */}
        {question.question_type === 'Recognition' && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isCorrect !== null}
              placeholder="Type your answer here..."
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none disabled:bg-gray-50"
            />
            {isCorrect === null && (
              <Button type="submit" disabled={!userAnswer.trim()} className="w-full">
                Check Answer
              </Button>
            )}
          </form>
        )}

        {/* Feedback Section */}
        {isCorrect !== null && (
          <div className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-4 ${
            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct! Well done.' : 'Incorrect.'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-gray-700 mt-1">
                  The correct answer is: <span className="font-bold">{question.correct_answer}</span>
                </p>
              )}
            </div>
            
            <Button onClick={loadQuestion} className="w-full sm:w-auto shrink-0">
              Next Question
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <div className="max-w-5xl mx-auto py-4">
      <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-6 w-6 text-blue-600" /></div>}>
        <QuizContent />
      </Suspense>
    </div>
  );
}
