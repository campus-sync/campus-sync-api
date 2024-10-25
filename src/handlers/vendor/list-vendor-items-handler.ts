import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../middleware/error-middleware';
import VendorItem from '../../database/models/vendor-item-modal';
import { GenericAPIResponse } from '../../../types/global';
import { ObjectId } from 'mongodb';
import { ListVendorResBody } from '../../../types/vendor';

export const listVendorItemsHandler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { vendorId } = req.params;

  const items = await VendorItem.getAllByVendor(new ObjectId(vendorId));

  const response: GenericAPIResponse<ListVendorResBody> = {
    success: true,
    code: 200,
    data: {
      message: 'List of Vendor Items',
      items,
    },
  };

  return res.status(200).json(response);
});
