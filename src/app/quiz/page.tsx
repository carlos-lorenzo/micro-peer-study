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
    return <div className="text-center py-20 text-muted">No hay temas seleccionados. Vuelve y selecciona temas.</div>;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted">Cargando siguiente pregunta...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-20 space-y-4 animate-in zoom-in-95 duration-500">
        <h2 className="text-2xl font-bold text-foreground">No se encontraron preguntas</h2>
        <p className="text-muted">No pudimos encontrar preguntas activas para los temas seleccionados.</p>
        <Button onClick={loadQuestion} variant="outline" className="gap-2">
          <IterationCcw className="h-4 w-4" /> Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Left: Image Viewer */}
      <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <ZoomableImage src={question.image_url} alt="Diapositiva de histología" />
        
        <div className="flex justify-between items-center px-2 text-sm text-muted">
          <span>Tema: <span className="font-semibold text-foreground">{question.topic}</span></span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleFlag} 
            disabled={isFlagging || hasFlagged}
            className={hasFlagged ? 'text-danger bg-danger/10 hover:bg-danger/20' : 'text-muted hover:text-danger hover:bg-danger/10'}
          >
            <Flag className="h-4 w-4 mr-2" />
            {hasFlagged ? 'Reportado' : 'Reportar Error'}
          </Button>
        </div>
      </div>

      {/* Right: Interaction */}
      <div className="bg-surface p-6 sm:p-8 rounded-xl ring-1 ring-muted-bg shadow-sm space-y-8 flex flex-col justify-center animate-in fade-in slide-in-from-right-4 duration-700">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Identifica la estructura</h2>
          <p className="text-muted text-sm leading-relaxed">
            {question.question_type === 'MCQ' 
              ? 'Selecciona la opción correcta de la lista a continuación.'
              : 'Ingresa el nombre de la estructura resaltada o mostrada.'}
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
                    className={`w-full justify-start text-left h-auto py-3 px-4 min-h-[3rem] transition-all duration-200 ${
                      isCorrect !== null && !isActuallyCorrect && !isSelected ? 'opacity-50 grayscale' : ''
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
              placeholder="Escribe tu respuesta aquí..."
              className="w-full rounded-md border border-muted bg-surface px-4 py-3 text-foreground placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors disabled:bg-muted-bg disabled:text-muted"
            />
            {isCorrect === null && (
              <Button type="submit" disabled={!userAnswer.trim()} className="w-full shadow-sm hover:shadow-md">
                Comprobar Respuesta
              </Button>
            )}
          </form>
        )}

        {/* Feedback Section */}
        {isCorrect !== null && (
          <div className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-4 animate-in zoom-in-95 duration-300 ${
            isCorrect ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'
          }`}>
            <div>
              <p className={`font-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                {isCorrect ? '¡Correcto! Muy bien.' : 'Incorrecto.'}
              </p>
              {!isCorrect && (
                <p className="text-sm text-foreground mt-1">
                  La respuesta correcta es: <span className="font-bold">{question.correct_answer}</span>
                </p>
              )}
            </div>
            
            <Button onClick={loadQuestion} className="w-full sm:w-auto shrink-0 shadow-sm hover:shadow-md">
              Siguiente Pregunta
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
      <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-6 w-6 text-primary" /></div>}>
        <QuizContent />
      </Suspense>
    </div>
  );
}
