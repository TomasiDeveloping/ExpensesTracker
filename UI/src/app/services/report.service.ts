import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ReportModel} from "../models/report.model";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly _serviceUrl: string = environment.apiUrl + 'reports/';
  private readonly _httpClient: HttpClient = inject(HttpClient);

  createYearlyExcelReport(report: ReportModel): Observable<any> {
    return this._httpClient.post(this._serviceUrl + 'CreateYearlyExcelReport', report, {
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
    return this._httpClient.post(this._serviceUrl + 'CreateMonthlyExcelReport', report, {
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
