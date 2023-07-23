export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  createdAt: Date;
  isActive: boolean;
  monthlyBudget: number;
  withRevenue: boolean;
}
