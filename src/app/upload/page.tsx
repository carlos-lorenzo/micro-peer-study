"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createQuestionAction } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Loader2, UploadCloud, X } from 'lucide-react';
import type { QuestionType } from '@/lib/queries';

const AVAILABLE_TOPICS = [
  'Epitelio de revestimiento',
  'Epitelio glandular',
  'Conectivo',
  'Tejido muscular',
  'Tejido nervioso',
  'Sangre y aparato circulatorio',
  'Sistema cardiorespiratorio',
  'Sistema digestivo',
  'Sistemas renal y tegumentario',
  'Sistema osteoarticular y ingeniería tisular'
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState('Epitelio de revestimiento');
  const [questionType, setQuestionType] = useState<QuestionType>('Recognition');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '']); // Distractors
  const [file, setFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            // Generating a default filename for pasted images
            const fileWithFallbackName = new File(
              [pastedFile],
              pastedFile.name === 'image.png' ? `pasted-image-${Date.now()}.png` : pastedFile.name,
              { type: pastedFile.type }
            );
            setFile(fileWithFallbackName);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!file) {
      setError('Por favor sube una imagen.');
      return;
    }
    if (!correctAnswer.trim()) {
      setError('Por favor proporciona la respuesta correcta.');
      return;
    }
    if (questionType === 'MCQ' && options.some(opt => !opt.trim())) {
      setError('Por favor llena todas las opciones distractoras.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload to Vercel Blob
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const blob = await response.json();

      // 2. Save metadata to Supabase
      await createQuestionAction({
        image_url: blob.url,
        topic,
        question_type: questionType,
        correct_answer: correctAnswer,
        options: questionType === 'MCQ' ? options : null,
      });

      // Navigate back or reset
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error durante la subida.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-extrabold text-foreground">Subir una Pregunta</h1>
        <p className="mt-2 text-muted">Ayuda a expandir nuestro banco de preguntas compartido entre pares.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm ring-1 ring-muted-bg space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
        {/* Error message */}
        {error && (
          <div className="p-3 bg-danger/10 text-danger rounded-md text-sm font-medium flex items-start gap-2">
            <X className="h-4 w-4 mt-0.5 cursor-pointer" onClick={() => setError(null)} />
            {error}
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Imagen</label>
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-muted border-dashed rounded-md cursor-pointer hover:bg-muted-bg/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted" />
              <div className="flex text-sm text-muted items-center justify-center">
                <span className="relative rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary ring-offset-surface">
                  <span>Sube un archivo</span>
                  <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </span>
                <p className="pl-1">, arrastra y suelta, o usa <kbd className="px-1.5 py-0.5 mx-1 border border-muted-bg rounded-md bg-muted-bg/50">Ctrl+V</kbd></p>
              </div>
              <p className="text-xs text-muted">PNG, JPG, GIF hasta 10MB</p>
              {file && (
                <p className="text-sm font-semibold text-success mt-2">Seleccionado: {file.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Topic dropdown */}
        <div className="space-y-1">
          <label htmlFor="topic" className="block text-sm font-medium text-foreground">Tema</label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md border bg-surface text-foreground"
          >
            {AVAILABLE_TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Question Type */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground">Tipo de Pregunta</label>
          <div className="mt-2 flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary focus:ring-primary h-4 w-4"
                checked={questionType === 'Recognition'}
                onChange={() => setQuestionType('Recognition')}
              />
              <span className="ml-2 text-foreground font-medium">Reconocimiento textual</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-primary focus:ring-primary h-4 w-4"
                checked={questionType === 'MCQ'}
                onChange={() => setQuestionType('MCQ')}
              />
              <span className="ml-2 text-foreground font-medium">Opción Múltiple</span>
            </label>
          </div>
        </div>

        {/* Correct Answer */}
        <div className="space-y-1">
          <label htmlFor="correctAnswer" className="block text-sm font-medium text-foreground">
            Respuesta Correcta
          </label>
          <input
            type="text"
            id="correctAnswer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="ej. Epitelio Escamoso Estratificado"
            className="mt-1 flex w-full border border-muted bg-surface text-foreground rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
          />
        </div>

        {/* Distractors (If MCQ) */}
        {questionType === 'MCQ' && (
          <div className="space-y-4 pt-4 border-t border-muted-bg">
            <h3 className="text-sm font-semibold text-foreground">Opciones Incorrectas (Distractores)</h3>
            {options.map((opt, idx) => (
              <div key={idx} className="space-y-1">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Distractor ${idx + 1}`}
                  className="block w-full border border-muted bg-surface text-foreground rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-muted-bg flex justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            className="mr-2"
            onClick={() => router.back()}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isUploading} className="min-w-32">
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subir Pregunta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
