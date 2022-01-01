import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ExpenseModel} from "../models/expense.model";
import {ReportModel} from "../models/report.model";

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  serviceUrl = environment.apiUrl + 'expenses/';

  constructor(private readonly http: HttpClient) {
  }

  getExpenses(): Observable<ExpenseModel[]> {
    return this.http.get<ExpenseModel[]>(this.serviceUrl);
  }

  getExpense(expenseId: number): Observable<ExpenseModel> {
    return this.http.get<ExpenseModel>(this.serviceUrl + expenseId);
  }

  getUserExpenses(userId: number): Observable<ExpenseModel[]> {
    return this.http.get<ExpenseModel[]>(this.serviceUrl + 'user/' + userId);
  }

  getUserExpensesByQueryParams(userId: number, year: number, month: number): Observable<ExpenseModel[]> {
    let params = new HttpParams();
    params = params.set('year', year);
    params = params.set('month', month);
    return this.http.get<ExpenseModel[]>(this.serviceUrl + 'user/' + userId, {params});
  }

  getUserExpensesByCategory(userId: number, categoryId: number): Observable<ExpenseModel[]> {
    return this.http.get<ExpenseModel[]>(this.serviceUrl + 'user/' + userId + 'category/' + categoryId);
  }

  insertExpense(expense: ExpenseModel): Observable<ExpenseModel> {
    return this.http.post<ExpenseModel>(this.serviceUrl, expense);
  }

  createYearlyExcelReport(report: ReportModel): Observable<any> {
    return this.http.post(this.serviceUrl + 'CreateYearlyExcelReport', report, {
      observe: 'response',
      responseType: 'blob'
    })
      .pipe(map((res) => {
        return {
          // @ts-ignore
          image: new Blob([res.body], {type: res.headers.get('Content-Type')}),
          filename: res.headers.get('x-file-name')
        }
      }))
  }

  createMonthlyExcelReport(report: ReportModel): Observable<any> {
    return this.http.post(this.serviceUrl + 'CreateMonthlyExcelReport', report, {
      observe: 'response',
      responseType: 'blob'
    })
      .pipe(map((res) => {
        return {
          // @ts-ignore
          image: new Blob([res.body], {type: res.headers.get('Content-Type')}),
          filename: res.headers.get('x-file-name')
        }
      }))
  }

  updateExpense(expenseId: number, expense: ExpenseModel): Observable<ExpenseModel> {
    return this.http.put<ExpenseModel>(this.serviceUrl + expenseId, expense);
  }

  deleteExpense(expenseId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + expenseId);
  }
}
