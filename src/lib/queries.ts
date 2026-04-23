import { supabase } from './supabase';

export type QuestionType = 'MCQ' | 'Recognition';

export interface Question {
  id: string;
  created_at: string;
  image_url: string;
  topic: string;
  question_type: QuestionType;
  correct_answer: string;
  options: string[] | null;
  flags_count: number;
  is_active: boolean;
}

export type NewQuestionData = Omit<Question, 'id' | 'created_at' | 'flags_count' | 'is_active'>;

/**
 * Fetches a random active question that matches ANY of the provided topics.
 * Since Supabase JS client does not have a built-in `.random()` without a Postgres RPC,
 * we fetch the active IDs for the topics, select a random ID, and then fetch the complete row.
 */
export async function getRandomQuestion(topics: string[]): Promise<Question | null> {
  if (!topics || topics.length === 0) return null;

  // Step 1: Fetch active IDs matching the topics
  const { data: idData, error: idError } = await supabase
    .from('questions')
    .select('id')
    .eq('is_active', true)
    .in('topic', topics);

  if (idError) {
    console.error('Error fetching question IDs:', idError);
    return null;
  }

  if (!idData || idData.length === 0) {
    return null;
  }

  // Step 2: Pick a random ID from the result set
  const randomId = idData[Math.floor(Math.random() * idData.length)].id;

  // Step 3: Fetch the complete question details
  const { data: questionData, error: questionError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', randomId)
    .single();

  if (questionError || !questionData) {
    console.error('Error fetching the random question data:', questionError);
    return null;
  }

  return questionData as Question;
}

/**
 * Creates a newly uploaded question in the database.
 */
export async function createQuestion(questionData: NewQuestionData): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .insert([
      {
        image_url: questionData.image_url,
        topic: questionData.topic,
        question_type: questionData.question_type,
        correct_answer: questionData.correct_answer,
        options: questionData.options,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting new question:', error);
    throw error;
  }

  return data as Question;
}
