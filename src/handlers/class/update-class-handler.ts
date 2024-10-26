import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../middleware/error-middleware';
import ClassModal from '../../database/models/class-modal';
import { GenericAPIBody, GenericAPIResponse } from '../../../types/global';

export const updateClassHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id, classCode, classDescription, department, subjects } = req.body;

  const classItem = await ClassModal.getById(id);
  if (!classItem) {
    return next(new Error('Class not found'));
  }

  if (classCode) classItem.classCode = classCode;
  if (classDescription) classItem.classDescription = classDescription;
  if (department) classItem.department = department;
  if (subjects) classItem.subjects = subjects;

  await classItem.update();

  const response: GenericAPIResponse<GenericAPIBody> = {
    success: true,
    code: 200,
    data: {
      message: 'Class updated successfully',
    },
  };

  return res.status(200).json(response);
});
