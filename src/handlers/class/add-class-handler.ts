import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../middleware/error-middleware';
import ClassModal, { ClassDepartment, Subject } from '../../database/models/class-modal';
import { GenericAPIBody, GenericAPIResponse } from '../../../types/global';

export const addClassHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { classCode, classDescription, department, subjects } = req.body;

  const newClass = new ClassModal(classCode, classDescription, department as ClassDepartment, subjects as Subject[]);
  await newClass.save();

  const response: GenericAPIResponse<GenericAPIBody> = {
    success: true,
    code: 201,
    data: {
      message: 'Class added successfully',
    },
  };

  return res.status(201).json(response);
});
