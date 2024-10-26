import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../middleware/error-middleware';
import ClassModal from '../../database/models/class-modal';
import { GenericAPIResponse } from '../../../types/global';

export const listCalendarsHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Fetch all classes to find the relevant class for the student
  const classes = await ClassModal.getAll();
  const calendarEvents: { start: string; end: string; title: string; color: string; id: string }[] = [];

  for (const classItem of classes) {
    const events = await classItem.getCalendarEvents();
    calendarEvents.push(...events);
  }

  const response: GenericAPIResponse<{ events: typeof calendarEvents }> = {
    success: true,
    code: 200,
    data: {
      events: calendarEvents,
    },
  };

  return res.status(200).json(response);
});
