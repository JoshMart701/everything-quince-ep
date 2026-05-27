import Anthropic from '@anthropic-ai/sdk';
import type { ReviewScore } from './types';
import { REVIEW_CATEGORIES } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCoachingSummary(
  employeeName: string,
  period: string,
  scores: ReviewScore[],
  overallNotes: string | null
): Promise<string> {
  const scoreLines = scores.map((s) => {
    const cat = REVIEW_CATEGORIES.find((c) => c.key === s.category);
    const label = cat?.label ?? s.category;
    const stars = '★'.repeat(s.rating) + '☆'.repeat(5 - s.rating);
    return `- ${label}: ${stars} (${s.rating}/5)${s.notes ? ` — "${s.notes}"` : ''}`;
  });

  const averageRating =
    scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.rating, 0) / scores.length).toFixed(1)
      : 'N/A';

  const prompt = `You are an expert performance coach. Based on the performance review data below, write a personalized, constructive coaching summary for ${employeeName} covering their ${period} review period.

Performance Scores (average: ${averageRating}/5):
${scoreLines.join('\n')}
${overallNotes ? `\nManager Notes: "${overallNotes}"` : ''}

Write a coaching summary with these sections:
1. **Strengths** (2-3 specific strengths based on top scores)
2. **Growth Areas** (2-3 actionable improvement areas for lower scores)
3. **Action Plan** (3 concrete steps the employee can take in the next quarter)

Keep the tone warm, encouraging, and specific. Use 250-350 words total. Address the employee directly as "you".`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic');
  }

  return content.text;
}
