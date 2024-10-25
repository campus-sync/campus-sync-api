import { CanteenItemAbstracted, CanteenItemDbBody } from '../../../types/canteen';
import { pool } from '../connection';

export default class Canteen_Item {
  private _id?: number;

  name: string;
  description: string;
  price: number;
  type: string;

  constructor(name: string, description: string, price: number, type: string, id?: number) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.type = type;

    if (id) this._id = id;
  }

  get id() {
    return this._id;
  }

  async save(): Promise<void> {
    const data = await pool.query(
      'INSERT INTO canteen_items(name, description, price, type) VALUES($1, $2, $3, $4) RETURNING id',
      [this.name, this.description, this.price, this.type]
    );
    this._id = data.rows[0].id;
  }

  async delete(): Promise<boolean> {
    const data = await pool.query('DELETE FROM canteen_items WHERE id = $1', [this.id]);
    if (data.rowCount === 0) return false;
    return true;
  }

  async update(): Promise<boolean> {
    const data = await pool.query(
      `
      UPDATE canteen_items SET name = $1, description = $2, price = $3, type = $4
      WHERE id = $5 RETURNING id`,
      [this.name, this.description, this.price, this.type, this.id]
    );

    if (data.rowCount === 0) return false;
    return true;
  }

  static async getAll(): Promise<CanteenItemDbBody[]> {
    const data = await pool.query('SELECT * FROM canteen_items');
    return data.rows;
  }

  static toAbstract(item: CanteenItemDbBody): CanteenItemAbstracted {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      type: item.type,
    };
  }

  static async getById(id: number): Promise<Canteen_Item | null> {
    const data = await pool.query('SELECT * FROM canteen_items WHERE id = $1', [id]);
    if (data.rows.length === 0) return null;
    const item = data.rows[0];
    return new Canteen_Item(item.name, item.description, item.price, item.type, item.id);
  }
}
