import { GenerateLessonInput, LessonContent } from '../schemas/lesson.schemas';
import { getLogger } from '../lib/logger';

export interface GenerationResult {
  content: LessonContent;
  source: 'gemini' | 'fallback';
}

const FALLBACK_OBJECTIVE = (age: string, theme: string): string =>
  `Children will identify and describe ${theme.toLowerCase()} concepts appropriate for ${age}-year-olds.`;

const FALLBACK_ACTIVITY = (age: string, theme: string): string =>
  `1. Gather children in a circle and introduce the theme "${theme}".\n` +
  `2. Show pictures and ask children to name what they see.\n` +
  `3. Lead a short hands-on activity suited for ages ${age}.\n` +
  `4. Invite each child to share one thing they learned.`;

const FALLBACK_RHYME = (theme: string): string =>
  `${theme}, ${theme}, everywhere we go,\n` +
  `We see ${theme.toLowerCase()} in the morning glow.\n` +
  `Up above and down below,\n` +
  `${theme} is fun — we love it so!`;

const FALLBACK_WORKSHEET = (theme: string): string =>
  `Color the picture. Circle every ${theme.toLowerCase()} you can find. Draw one more.`;

const FALLBACK_MATERIALS: Record<string, string[]> = {
  Animals: ['Picture cards of animals', 'Crayons', 'Soft toy animal'],
  Colors: ['Color cards', 'Crayons', 'Plain paper'],
  'Numbers & Counting': ['Number flashcards', 'Counting beads', 'Paper cups'],
  'Family & Friends': ['Family photo cards', 'Drawing sheet', 'Crayons'],
  'Seasons & Weather': ['Season picture cards', 'Cotton balls', 'Paper plate'],
  'Plants & Gardens': ['Seed packets', 'Small pots', 'Soil', 'Watering can'],
  'Transport & Vehicles': ['Toy vehicles', 'Picture cards', 'Cardboard boxes'],
  'Water & Bubbles': ['Bubble solution', 'Blowing wand', 'Plastic cups', 'Towels'],
  Shapes: ['Shape cutouts', 'Drawing sheet', 'Crayons'],
  'My Body': ['Body part flashcards', 'Mirror', 'Bandages'],
};

function pickMaterials(theme: string): string[] {
  const exact = FALLBACK_MATERIALS[theme];
  if (exact) return exact;
  return ['Picture cards', 'Crayons', 'Paper sheet'];
}

export async function generateLessonContent(input: GenerateLessonInput): Promise<GenerationResult> {
  getLogger().info(
    { age: input.ageGroup, theme: input.theme },
    'generateLessonContent called (stub orchestrator)',
  );
  const content: LessonContent = {
    objective: FALLBACK_OBJECTIVE(input.ageGroup, input.theme),
    activity: FALLBACK_ACTIVITY(input.ageGroup, input.theme),
    rhyme: FALLBACK_RHYME(input.theme),
    worksheet: FALLBACK_WORKSHEET(input.theme),
    materials: pickMaterials(input.theme),
  };
  return { content, source: 'fallback' };
}
