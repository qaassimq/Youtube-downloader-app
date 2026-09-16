import { AIChannelSuggestion } from '../types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

export function getApiKey(): string {
  // Try environment variable first (Vite exposes VITE_ prefixed vars)
  const envKey = (import.meta as any).env?.VITE_DEEPSEEKAPI;
  if (envKey) return envKey;
  
  // Fall back to localStorage
  return localStorage.getItem('deepseekapi') || '';
}

export function setApiKey(key: string) {
  localStorage.setItem('deepseekapi', key);
}

export async function suggestChannels(
  topic: string,
  count: number = 10,
  apiKey?: string
): Promise<AIChannelSuggestion[]> {
  const key = apiKey || getApiKey();
  if (!key) {
    throw new Error('API key not configured. Please set your DeepSeek API key.');
  }

  const systemPrompt = `You are a YouTube channel discovery expert. When given a topic, you suggest relevant, popular, and high-quality YouTube channels. You MUST respond with valid JSON only, no markdown, no explanation outside the JSON.

Response format (JSON array):
[
  {
    "channelName": "Exact channel name",
    "channelUrl": "https://youtube.com/@handle",
    "description": "Brief 1-sentence description of the channel",
    "category": "Main category (e.g., Tech, Education, Entertainment)",
    "reason": "Why this channel is relevant to the topic"
  }
]

Rules:
- Return EXACTLY the requested number of channels
- Use real, existing YouTube channels when possible
- Use the @handle format for URLs (e.g., https://youtube.com/@mkbhd)
- Focus on channels with substantial content (not tiny channels)
- Provide diverse and relevant suggestions`;

  const userPrompt = `Suggest ${count} YouTube channels about: "${topic}"

Please provide high-quality, relevant channels that someone interested in this topic would enjoy watching.`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message || 
        `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    const suggestions = JSON.parse(jsonStr);
    
    if (!Array.isArray(suggestions)) {
      throw new Error('Invalid response format from AI');
    }

    return suggestions.map((s: any) => ({
      channelName: s.channelName || 'Unknown',
      channelUrl: s.channelUrl || '',
      description: s.description || '',
      category: s.category || 'Other',
      reason: s.reason || '',
    }));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
    throw error;
  }
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
