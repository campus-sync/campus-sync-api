import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../middleware/error-middleware';
import ClassModal from '../../database/models/class-modal';
import { GenericAPIResponse } from '../../../types/global';

export const listClassesHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const classes = await ClassModal.getAll();

  const response: GenericAPIResponse<{ classes: ClassModal[] }> = {
    success: true,
    code: 200,
    data: {
      classes,
    },
  };

  return res.status(200).json(response);
});
