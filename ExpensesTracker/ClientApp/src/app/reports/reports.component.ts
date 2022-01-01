import {Component, OnInit} from '@angular/core';
import {ExpensesService} from "../services/expenses.service";
import * as jwt_decode from "jwt-decode";
import {ReportModel} from "../models/report.model";
import Swal from "sweetalert2";

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  currentUserId = 0;
  report: ReportModel = new class implements ReportModel {
    month = 0;
    userId = 0;
    year = 0;
  };

  months = [
    {name: 'Januar', value: 1},
    {name: 'Februar', value: 2},
    {name: 'März', value: 3},
    {name: 'April', value: 4},
    {name: 'Mai', value: 5},
    {name: 'Juni', value: 6},
    {name: 'Juli', value: 7},
    {name: 'August', value: 8},
    {name: 'September', value: 9},
    {name: 'Oktober', value: 10},
    {name: 'November', value: 11},
    {name: 'Dezember', value: 12},
  ];
  years: number[] = [];

  constructor(private expenseService: ExpensesService) {
  }

  ngOnInit(): void {
    this.createYears();
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      this.currentUserId = +decodeToken.nameid;
    }
  }

  createYears() {
    for (let i = 0; i < 5; i++) {
      this.years.push(this.currentYear - i);
    }
  }

  onCreateYearlyExcelReport() {
    this.report.year = this.currentYear;
    this.report.month = this.currentMonth;
    this.report.userId = this.currentUserId;
    this.expenseService.createYearlyExcelReport(this.report).subscribe({
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
    this.expenseService.createMonthlyExcelReport(this.report).subscribe({
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
  }

  getMonthName(monthValue: number): string {
    const month = this.months.find(e => e.value === monthValue);
    // @ts-ignore
    return month.name;
  }
}
