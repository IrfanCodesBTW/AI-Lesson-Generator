import { Router, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { requireAuth } from '../middleware/auth';
import { generateLessonSchema, listLessonsQuerySchema } from '../schemas/lesson.schemas';
import { BadRequestError, UnauthorizedError } from '../middleware/error';
import { listLessons, getLesson, deleteLesson, createLesson } from '../services/lesson.service';
import { generateLessonContent } from '../services/generator.orchestrator';

export const lessonsRouter = Router();

function parseOrThrow<T>(schema: { parse: (data: unknown) => T }, data: unknown, label: string): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new BadRequestError(
        `Invalid ${label}`,
        err.issues.map((i) => ({ path: i.path, message: i.message })),
      );
    }
    throw err;
  }
}

lessonsRouter.use(requireAuth);

lessonsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const q = parseOrThrow(listLessonsQuerySchema, req.query, 'query');
    const result = await listLessons(req.userId, q);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

lessonsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const id = String(req.params.id);
    const lesson = await getLesson(req.userId, id);
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
});

lessonsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const id = String(req.params.id);
    await deleteLesson(req.userId, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

lessonsRouter.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) throw new UnauthorizedError();
    const input = parseOrThrow(generateLessonSchema, req.body, 'body');
    const { content, source } = await generateLessonContent(input);
    const lesson = await createLesson(req.userId, input, content, source);
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
});
