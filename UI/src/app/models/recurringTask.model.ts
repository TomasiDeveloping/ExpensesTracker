export interface RecurringTask {
  id: number;
  userId: number;
  isActive: boolean;
  isRevenue: boolean;
  isExpense: boolean;
  categoryId?: number;
  expenseCategoryName?: string;
  revenueCategoryId?: number;
  revenueCategoryName: string;
  lastExecution: Date;
  nextExecution: Date;
  executeInMonths: number;
  amount: number;
  description: string;
}
