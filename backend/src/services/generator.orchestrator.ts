import { GenerateLessonInput, LessonContent } from '../schemas/lesson.schemas';
import { getLogger } from '../lib/logger';
import { callGemini, GeminiUnavailableError, GeminiInvalidResponseError } from './gemini.client';
import { getFallbackTemplate } from './fallback.templates';

export interface GenerationResult {
  content: LessonContent;
  source: 'gemini' | 'fallback';
}

export async function generateLessonContent(input: GenerateLessonInput): Promise<GenerationResult> {
  const log = getLogger().child({
    component: 'orchestrator',
    age: input.ageGroup,
    theme: input.theme,
  });

  try {
    const content = await callGemini(input);
    log.info('used gemini primary');
    return { content, source: 'gemini' };
  } catch (err) {
    const reason =
      err instanceof GeminiUnavailableError
        ? 'unavailable'
        : err instanceof GeminiInvalidResponseError
          ? 'invalid-response'
          : 'unknown';
    log.warn({ err: (err as Error)?.message, reason }, 'gemini failed, using fallback template');
    const content = getFallbackTemplate(input.theme, input.ageGroup);
    return { content, source: 'fallback' };
  }
}
