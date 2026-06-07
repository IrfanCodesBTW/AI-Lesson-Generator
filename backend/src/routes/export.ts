import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { UnauthorizedError } from '../middleware/error';
import { getLesson } from '../services/lesson.service';
import { streamLessonPdf } from '../services/pdf.service';

export const exportRouter = Router();

exportRouter.get(
  '/pdf/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const id = String(req.params.id);
      const lesson = await getLesson(req.userId, id);
      streamLessonPdf(lesson, res);
    } catch (err) {
      next(err);
    }
  },
);
