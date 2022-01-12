import {Component, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import {ReportModel} from "../models/report.model";
import Swal from "sweetalert2";
import {MonthNamePipe} from "../util/month-name.pipe";
import {AuthService} from "../services/auth.service";
import {RevenueService} from "../services/revenue.service";
import {UsersService} from "../services/users.service";
import {ReportService} from "../services/report.service";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  view: any;
  animations: boolean = false;
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  currentUserId = 0;
  report: ReportModel = new class implements ReportModel {
    month = 0;
    userId = 0;
    year = 0;
  };
  yearlyExpenses: { name: string, value: number }[] = [];
  months: { name: string; value: number }[] = [];
  years: number[] = [];
  yearlyRevenues: { name: string, value: number }[] = [];
  isWithRevenue: boolean = false;
  yearlyExpensesAmount = 0;
  yearlyRevenuesAmount = 0;

  constructor(private expenseService: ExpensesService,
              private authService: AuthService,
              private userService: UsersService,
              private revenueService: RevenueService,
              private reportService: ReportService,
              private monthPipe: MonthNamePipe) {
    this.view = [innerWidth / 1.1, 300];
  }

  ngOnInit(): void {
    this.createYears();
    this.createMonths();
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
    }
    this.isWithRevenue = this.userService.getWithRevenue();
    this.getUserYearExpenses();
    if (this.isWithRevenue) {
      this.getUserYearRevenues();
    }
  }

  getUserYearExpenses() {
    this.disableAnimations(); //Workaround for ngx charts when animation is set to true the values can not be adjusted with custom methods
    this.yearlyExpenses = [];
    this.yearlyExpensesAmount = 0;
    this.expenseService.getUserYearlyExpenses(this.currentUserId, this.currentYear).subscribe({
      next: ((response) => {
        if (response && response.length > 0) {
          response.forEach((expense) => {
            const checkExpenseExists = this.yearlyExpenses.find(e => e.name === expense.categoryName);
            if (checkExpenseExists) {
              const currentCategory = this.yearlyExpenses.find(e => e.name === expense.categoryName);
              // @ts-ignore
              currentCategory.value += expense.amount;
            } else {
              this.yearlyExpenses.push({name: expense.categoryName, value: expense.amount})
            }
            this.yearlyExpensesAmount += expense.amount;
          })
        }
      })
    });
  }

  getUserYearRevenues() {
    this.yearlyRevenues = [];
    this.yearlyRevenuesAmount = 0;
    this.revenueService.getUserYearlyExpenses(this.currentUserId, this.currentYear).subscribe({
      next: ((response) => {
        if (response && response.length > 0) {
          response.forEach((revenue) => {
            const checkExpenseExists = this.yearlyRevenues.find(e => e.name === revenue.categoryName);
            if (checkExpenseExists) {
              const currentCategory = this.yearlyRevenues.find(e => e.name === revenue.categoryName);
              // @ts-ignore
              currentCategory.value += revenue.amount;
            } else {
              this.yearlyRevenues.push({name: revenue.categoryName, value: revenue.amount})
            }
            this.yearlyRevenuesAmount += revenue.amount;
          })
        }
      })
    });
  }

  createYears() {
    for (let i = 0; i < 5; i++) {
      this.years.push(this.currentYear - i);
    }
  }

  createMonths() {
    for (let i = 1; i <= 12; i++) {
      this.months.push({name: this.monthPipe.transform(i), value: i});
    }
  }

  onCreateYearlyExcelReport() {
    this.report.year = this.currentYear;
    this.report.month = this.currentMonth;
    this.report.userId = this.currentUserId;
    this.reportService.createYearlyExcelReport(this.report).subscribe({
      next: (res) => {
        this.createDownload(res);
      },
      error: (error) => {
        Swal.fire('Jahres Statistik', error.error, 'error').then();
      }
    });
  }

  onCreateMonthlyExcelReport() {
    this.report.year = this.currentYear;
    this.report.month = this.currentMonth;
    this.report.userId = this.currentUserId;
    this.reportService.createMonthlyExcelReport(this.report).subscribe({
      next: (res) => {
        this.createDownload(res);
      },
      error: (error) => {
        Swal.fire('Monats Statistik', error.error, 'error').then();
      }
    });
  }

  createDownload(data: any) {
    const element = document.createElement('a');
    element.href = URL.createObjectURL(data.image);
    element.download = data.filename;
    document.body.appendChild(element);
    element.click();
  }

  onMonthChange(event: any) {
    this.currentMonth = +event.target.value;
  }

  onYearChange(event: any) {
    this.currentYear = event.target.value;
    this.getUserYearExpenses();
    if (this.isWithRevenue) {
      this.getUserYearRevenues();
    }
  }

  setValueFormatting(c: any): any {
    return c.toFixed(2);
  }

  setLabelFormatting(c: any): any {
    return `CHF ${c}`;
  }

  //Workaround for ngx charts when animation is set to true the values can not be adjusted with custom methods
  disableAnimations() {
    this.animations = true;
    setTimeout(() => {
      this.animations = false;
    }, 1000);
  }

  onResize(event: any) {
    this.view = [event.target.innerWidth / 1.1, 300];
  }
}
