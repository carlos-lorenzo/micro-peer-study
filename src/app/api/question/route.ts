import { NextResponse } from 'next/server';
import { createQuestion } from '@/lib/queries';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body?.image_url || !body?.topic || !body?.question_type || !body?.correct_answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const created = await createQuestion({
      image_url: body.image_url,
      topic: body.topic,
      question_type: body.question_type,
      correct_answer: body.correct_answer,
      options: body.options ?? null,
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    console.error('Error creating question:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
