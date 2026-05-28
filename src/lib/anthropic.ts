import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ScoreInput {
  category: string;
  rating: number;
  notes?: string | null;
}

export async function generateCoachingSummary(
  employeeName: string,
  period: string,
  scores: ScoreInput[],
  overallNotes: string | null
): Promise<string> {
  const scoreLines = scores.map((s) => {
    const stars = '★'.repeat(s.rating) + '☆'.repeat(5 - s.rating);
    return `- ${s.category}: ${stars} (${s.rating}/5)${s.notes ? ` — "${s.notes}"` : ''}`;
  });

  const avgRating =
    scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.rating, 0) / scores.length).toFixed(1)
      : 'N/A';

  const prompt = `You are an expert performance coach. Write a personalized, constructive coaching summary for ${employeeName} based on their ${period} review.

Performance scores (average: ${avgRating}/5):
${scoreLines.join('\n')}
${overallNotes ? `\nManager notes: "${overallNotes}"` : ''}

Structure your response with these three sections:
**Strengths** — 2-3 specific strengths based on top-rated categories
**Growth Areas** — 2-3 actionable improvement areas for lower-rated categories
**Action Plan** — 3 concrete steps for the next quarter

Tone: warm, encouraging, specific. Address the employee as "you". 250–350 words total.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected Anthropic response type');
  return content.text;
}
