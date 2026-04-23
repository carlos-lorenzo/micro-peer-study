import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client
// We use a service role key if we are doing updates without RLS or public anon if RLS allows it.
// Assuming we have basic supabase env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Basic in-memory rate limiting for IP addresses (for demo/MVP purposes)
// In a real production app, use Redis or a similar persistent store
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_FLAGS_PER_WINDOW = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question_id } = body;

    if (!question_id) {
      return NextResponse.json({ error: 'question_id is required' }, { status: 400 });
    }

    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Simple rate limiting check
    const now = Date.now();
    const userRateData = rateLimit.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
    
    if (now > userRateData.resetTime) {
      userRateData.count = 1;
      userRateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      userRateData.count += 1;
    }
    
    rateLimit.set(ip, userRateData);

    if (userRateData.count > MAX_FLAGS_PER_WINDOW) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // 1. Fetch current flags_count
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('flags_count')
      .eq('id', question_id)
      .single();

    if (fetchError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const newFlagsCount = question.flags_count + 1;
    const isActive = newFlagsCount < 5;

    // 2. Update the question
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        flags_count: newFlagsCount,
        is_active: isActive
      })
      .eq('id', question_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, flags_count: newFlagsCount, is_active: isActive });
  } catch (error) {
    console.error('Error reporting question:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
