"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createQuestionAction } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Loader2, UploadCloud, X } from 'lucide-react';
import type { QuestionType } from '@/lib/queries';

const AVAILABLE_TOPICS = [
  'Epithelial',
  'Connective',
  'Muscle',
  'Nervous',
  'Cartilage',
  'Bone',
  'Blood',
  'Other'
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState('Epithelial');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!file) {
      setError('Please upload an image.');
      return;
    }
    if (!correctAnswer.trim()) {
      setError('Please provide the correct answer.');
      return;
    }
    if (questionType === 'MCQ' && options.some(opt => !opt.trim())) {
      setError('Please fill out all distractor options.');
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
        throw new Error('Failed to upload image');
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
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">Upload a Question</h1>
        <p className="mt-2 text-gray-600">Help grow the unauthenticated, shared peer-to-peer pool.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm ring-1 ring-gray-200 space-y-6">
        
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm font-medium flex items-start gap-2">
            <X className="h-4 w-4 mt-0.5" onClick={() => setError(null)} />
            {error}
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              {file && (
                <p className="text-sm font-semibold text-green-600 mt-2">Selected: {file.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Topic dropdown */}
        <div className="space-y-1">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white"
          >
            {AVAILABLE_TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Question Type */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Question Type</label>
          <div className="mt-2 flex gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600 h-4 w-4"
                checked={questionType === 'Recognition'}
                onChange={() => setQuestionType('Recognition')}
              />
              <span className="ml-2 text-gray-700 font-medium">Text Recognition</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600 h-4 w-4"
                checked={questionType === 'MCQ'}
                onChange={() => setQuestionType('MCQ')}
              />
              <span className="ml-2 text-gray-700 font-medium">Multiple Choice</span>
            </label>
          </div>
        </div>

        {/* Correct Answer */}
        <div className="space-y-1">
          <label htmlFor="correctAnswer" className="block text-sm font-medium text-gray-700">
            Correct Answer
          </label>
          <input
            type="text"
            id="correctAnswer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="e.g. Stratified Squamous Epithelium"
            className="mt-1 flex w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Distractors (If MCQ) */}
        {questionType === 'MCQ' && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Incorrect Options (Distractors)</h3>
            {options.map((opt, idx) => (
              <div key={idx} className="space-y-1">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Distractor ${idx + 1}`}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            className="mr-2"
            onClick={() => router.back()}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading} className="min-w-32">
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Upload Question'}
          </Button>
        </div>
      </form>
    </div>
  );
}
