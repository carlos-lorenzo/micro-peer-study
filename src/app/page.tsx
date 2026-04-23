"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Square } from 'lucide-react';

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
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Bienvenido a <span className="text-primary">Histology Hub</span>
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto">
          Una plataforma de estudio entre pares para estudiantes de ingeniería biomédica. Selecciona los temas que deseas practicar y empieza una sesión.
        </p>
      </div>

      <div className="bg-surface p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 ring-1 ring-muted-bg rounded-xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <h2 className="text-xl font-semibold text-foreground">Selecciona Temas de Práctica</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_TOPICS.map((topic) => {
            const isSelected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 active:scale-95 ${
                  isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-muted-bg hover:border-primary/50 hover:bg-muted-bg/50 text-foreground'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-primary flex-shrink-0 transition-transform duration-200" />
                ) : (
                  <Square className="h-5 w-5 text-muted flex-shrink-0 transition-transform duration-200" />
                )}
                <span className="font-medium text-sm leading-tight">{topic}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-muted-bg">
          <p className="text-sm font-medium text-muted">
            {selectedTopics.length} tema{selectedTopics.length !== 1 ? 's' : ''} seleccionado{selectedTopics.length !== 1 ? 's' : ''}
          </p>
          <Button 
            size="lg" 
            onClick={startSession}
            disabled={selectedTopics.length === 0}
            className="w-full sm:w-auto"
          >
            Empezar Práctica
          </Button>
        </div>
      </div>
    </div>
  );
}
