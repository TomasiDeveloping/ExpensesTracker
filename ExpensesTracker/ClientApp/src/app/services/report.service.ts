import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ReportModel} from "../models/report.model";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  serviceUrl = environment.apiUrl + 'reports/';

  constructor(private readonly http: HttpClient) { }

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
}
