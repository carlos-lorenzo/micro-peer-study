"use server";

import { getRandomQuestion, createQuestion, type NewQuestionData } from '@/lib/queries';

export async function fetchRandomQuestionAction(topics: string[]) {
  return await getRandomQuestion(topics);
}

export async function createQuestionAction(data: NewQuestionData) {
  return await createQuestion(data);
}
