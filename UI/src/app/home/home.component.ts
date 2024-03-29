import {Component, inject, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ExpenseModel} from "../models/expense.model";
import {UserModel} from "../models/user.model";
import {UsersService} from "../services/users.service";
import {EditExpensesComponent} from "./edit-expenses/edit-expenses.component";
import {AuthService} from "../services/auth.service";
import {MonthNamePipe} from "../util/month-name.pipe";
import {RevenueModel} from "../models/revenue.model";
import {EditRevenueComponent} from "../revenues/edit-revenue/edit-revenue.component";
import {RevenueService} from "../services/revenue.service";
import {environment} from "../../environments/environment";
import {ChangeLogInfoBoxComponent} from "./change-log-info-box/change-log-info-box.component";
import {ApplicationVersionConfirmationService} from "../services/application-version-confirmation.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public userExpenses: ExpenseModel[] = [];
  public userRevenues: RevenueModel[] = [];
  public totalAmount: number = 0;
  public totalRevenueAmount: number = 0;
  public monthlyConsumptionPercent: number = 0;
  public userBudget: number = 0;
  public currentMonth: { value: number, name: string, year: number } = {value: 0, name: '', year: 0};
  public categoryGroups: { category: number, name: string, amount: number } [] = [];
  public isUserWithRevenue: boolean = false;

  private currentUserId: number = 0;
  private currentUser!: UserModel;
  private currentDate: Date = new Date();
  private showChangeLogBox: boolean = environment.showVersionInfo;
  private version: string = environment.versionToCheck;

  private readonly _expenseService: ExpensesService = inject(ExpensesService);
  private readonly _userService: UsersService = inject(UsersService);
  private readonly _monthPipe: MonthNamePipe = inject(MonthNamePipe);
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _revenueService: RevenueService = inject(RevenueService);
  private readonly _applicationVersionConfirmationService: ApplicationVersionConfirmationService = inject(ApplicationVersionConfirmationService);
  private readonly _dialog: MatDialog = inject(MatDialog);


  ngOnInit(): void {
    this.currentUserId = this._authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this._authService.logout();
    }
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    this.totalAmount = 0;
    this.totalRevenueAmount = 0;
    this.userExpenses = [];
    this.userRevenues = [];
    this.categoryGroups = [];
    this._userService.getUserById(this.currentUserId).subscribe({
      next: ((response) => {
        this.currentUser = response;
        this.userBudget = response.monthlyBudget;
        this.isUserWithRevenue = response.withRevenue;
        this.getUserExpenses();
        this.getCurrentMonth();
        this.checkChangeLogBox();
        if (this.isUserWithRevenue) {
          this.getUserRevenues();
        }
      })
    })
  }

  getUserExpenses(): void {
    this._expenseService.getUserExpensesByQueryParams(this.currentUserId, this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1)
      .subscribe({
        next: ((response) => {
          this.userExpenses = response;
          if (response) {
            response.forEach(expense => {
              this.totalAmount += expense.amount;
              const categoryExists = this.categoryGroups.some(el => el.category === expense.categoryId);
              if (categoryExists) {
                let category = this.categoryGroups.find(s => s.category === expense.categoryId)
                // @ts-ignore
                category.amount += expense.amount;
              } else {
                this.categoryGroups.push({
                  name: expense.categoryName,
                  category: expense.categoryId,
                  amount: expense.amount
                })
              }
            })
            this.CalculateExpensesInPercent(this.totalAmount);
          }
        })
      });
  }

  getUserRevenues(): void {
    this._revenueService.getUserRevenuesByQueryParams(this.currentUserId, this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1).subscribe({
      next: ((response) => {
        this.userRevenues = response;
        if (response) {
          response.forEach((revenue) => {
            this.totalRevenueAmount += revenue.amount;
          })
        }
      })
    });
  }

  onAddExpense(): void {
    const expense: ExpenseModel = new class implements ExpenseModel {
      amount = 0;
      categoryId = 0;
      categoryName = '';
      createDate = new Date();
      description = '';
      id = 0;
      userId = 0;
    }
    expense.userId = this.currentUserId;
    const dialogRef = this._dialog.open(EditExpensesComponent, {
      width: '80%',
      height: 'auto',
      autoFocus: false,
      data: {isUpdate: false, expense: expense}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'update') {
        this.getCurrentUser();
      }
    });
  }

  onAddRevenue(): void {
    const revenue: RevenueModel = new class implements RevenueModel {
      amount = 0;
      categoryName = '';
      createDate = new Date();
      description = '';
      id = 0;
      revenueCategoryId = 0;
      userId = 0;
    };
    revenue.userId = this.currentUserId;
    const dialogRef = this._dialog.open(EditRevenueComponent, {
      width: '80%',
      height: 'auto',
      autoFocus: false,
      data: {isUpdate: false, revenue: revenue}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'update') {
        this.getCurrentUser();
      }
    });
  }

  checkChangeLogBox(): void {
    if (this.showChangeLogBox) {
      if (this.currentUserId <= 0) return;
      this._applicationVersionConfirmationService.checkUserHasConfirmed(this.currentUserId, this.version).subscribe({
        next: ((confirmed) => {
          if (!confirmed) {
            this._dialog.open(ChangeLogInfoBoxComponent, {
              width: '80%',
              height: 'auto',
              disableClose: true,
              data: {userId: this.currentUserId, version: this.version}
            })
          }
        })
      });
    }
  }

  private CalculateExpensesInPercent(totalAmount: number): void {
    if (this.userBudget > 0) {
      this.monthlyConsumptionPercent = (100 / this.userBudget) * totalAmount;
      this.monthlyConsumptionPercent = Math.round(this.monthlyConsumptionPercent * 100) / 100;
    }
  }

  private getCurrentMonth(): void {
    const currentMonth = new Date().getMonth() + 1;
    this.currentMonth.year = new Date().getFullYear();
    this.currentMonth.value = currentMonth;
    this.currentMonth.name = this._monthPipe.transform(currentMonth);
  }
}
