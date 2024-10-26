import { Request, Response, NextFunction } from 'express';
import { AppError, catchAsync } from '../../middleware/error-middleware';
import ClassModal from '../../database/models/class-modal';
import { GenericAPIBody, GenericAPIResponse } from '../../../types/global';

export const deleteClassHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;

  const classItem = await ClassModal.getById(id);
  if (!classItem) {
    return next(new AppError('Class not found', 'INVALID_PARAMETERS', 404));
  }

  await classItem.delete();

  const response: GenericAPIResponse<GenericAPIBody> = {
    success: true,
    code: 200,
    data: {
      message: 'Class deleted successfully',
    },
  };

  return res.status(200).json(response);
});
