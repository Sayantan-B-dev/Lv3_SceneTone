import { useMutation } from '@tanstack/react-query';
import { aiRequest } from '@/lib/api';

export interface GuideChatRequest {
  question: string;
  pageContext: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface GuideChatResponse {
  answer: string;
  model: string;
  provider: string;
}

export function useGuideChat() {
  return useMutation({
    mutationFn: (input: GuideChatRequest) =>
      aiRequest<GuideChatResponse>('/ai/guide', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}
