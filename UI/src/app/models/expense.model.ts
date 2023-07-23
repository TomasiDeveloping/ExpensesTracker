export interface ExpenseModel {
  id: number;
  userId: number;
  categoryName: string;
  categoryId: number;
  description: string;
  amount: number;
  createDate: Date;
}
