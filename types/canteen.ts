export type CanteenItemTypes = 'breakfast' | 'lunch' | 'snacks';

/*
 * Request Body
 */

export interface AddCanteenReqBody {
  name: string;
  description: string;
  price: number;
  type: CanteenItemTypes;
}

export interface UpdateCanteenReqBody {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  type?: CanteenItemTypes;
}

export interface DeleteCanteenItemReqBody {
  id: number;
}

/*
 * Response Body
 */

import { GenericAPIBody } from './global';

export interface CanteenItemAbstracted {
  id: number;
  name: string;
  description: string;
  price: number;
  type: CanteenItemTypes;
}

export interface ListCanteenItemsResBody extends GenericAPIBody {
  items: CanteenItemAbstracted[];
}

/*
 * Database Body
 */

export interface CanteenItemDbBody {
  id: number;
  name: string;
  description: string;
  price: number;
  type: CanteenItemTypes;
  created_at: Date;
  updated_at: Date;
}
