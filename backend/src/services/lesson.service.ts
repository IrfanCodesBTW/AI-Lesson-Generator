import { query } from '../lib/db';
import { NotFoundError } from '../middleware/error';
import { LessonContent, GenerateLessonInput, ListLessonsQuery } from '../schemas/lesson.schemas';

export interface Lesson {
  id: string;
  userId: string;
  ageGroup: '2-3' | '3-4' | '4-5' | '5-6';
  theme: string;
  lessonContent: LessonContent;
  source: 'gemini' | 'fallback';
  createdAt: string;
}

interface LessonRow {
  id: string;
  user_id: string;
  age_group: '2-3' | '3-4' | '4-5' | '5-6';
  theme: string;
  lesson_content: LessonContent;
  source: 'gemini' | 'fallback';
  created_at: Date;
}

function toLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    userId: row.user_id,
    ageGroup: row.age_group,
    theme: row.theme,
    lessonContent: row.lesson_content,
    source: row.source,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listLessons(
  userId: string,
  query_: ListLessonsQuery,
): Promise<{ items: Lesson[]; total: number; page: number; limit: number }> {
  const { theme, page, limit } = query_;
  const offset = (page - 1) * limit;

  const params: unknown[] = [userId];
  let where = 'WHERE user_id = $1';
  if (theme) {
    params.push(`%${theme}%`);
    where += ` AND theme ILIKE $${params.length}`;
  }

  const rowsPromise = query<LessonRow>(
    `SELECT id, user_id, age_group, theme, lesson_content, source, created_at
     FROM lesson_plans
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  const totalPromise = query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM lesson_plans ${where}`,
    params,
  );

  const [rows, totalRows] = await Promise.all([rowsPromise, totalPromise]);
  const total = Number(totalRows[0]?.count ?? 0);
  return {
    items: rows.map(toLesson),
    total,
    page,
    limit,
  };
}

export async function getLesson(userId: string, id: string): Promise<Lesson> {
  const rows = await query<LessonRow>(
    `SELECT id, user_id, age_group, theme, lesson_content, source, created_at
     FROM lesson_plans
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [id, userId],
  );
  const row = rows[0];
  if (!row) {
    throw new NotFoundError('Lesson not found');
  }
  return toLesson(row);
}

export async function deleteLesson(userId: string, id: string): Promise<void> {
  const result = await query<{ id: string }>(
    `DELETE FROM lesson_plans WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  if (result.length === 0) {
    throw new NotFoundError('Lesson not found');
  }
}

export async function createLesson(
  userId: string,
  input: GenerateLessonInput,
  content: LessonContent,
  source: 'gemini' | 'fallback',
): Promise<Lesson> {
  const rows = await query<LessonRow>(
    `INSERT INTO lesson_plans (user_id, age_group, theme, lesson_content, source)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, age_group, theme, lesson_content, source, created_at`,
    [userId, input.ageGroup, input.theme, JSON.stringify(content), source],
  );
  const row = rows[0];
  if (!row) throw new Error('Insert returned no row');
  return toLesson(row);
}
