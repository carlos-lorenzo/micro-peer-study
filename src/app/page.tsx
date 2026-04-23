"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Square } from 'lucide-react';

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

export default function LandingPage() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const startSession = () => {
    if (selectedTopics.length === 0) return;
    const query = selectedTopics.map((t) => encodeURIComponent(t)).join(',');
    router.push(`/quiz?topics=${query}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Welcome to <span className="text-blue-600">Histology Hub</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          A peer-to-peer study platform for biomedical engineering students. Select the tissue topics you want to practice and jump into a session.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-200 rounded-xl space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Select Practice Topics</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AVAILABLE_TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50 text-blue-900' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <span className="font-medium">{topic}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {selectedTopics.length} topic{selectedTopics.length !== 1 ? 's' : ''} selected
          </p>
          <Button 
            size="lg" 
            onClick={startSession}
            disabled={selectedTopics.length === 0}
            className="w-full sm:w-auto"
          >
            Start Practice Session
          </Button>
        </div>
      </div>
    </div>
  );
}
