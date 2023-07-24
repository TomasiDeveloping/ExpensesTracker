import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RecurringTask} from "../models/recurringTask.model";

@Injectable({
  providedIn: 'root'
})
export class RecurringTaskService {

  private readonly _serviceUrl: string = environment.apiUrl + 'recurringTask/';
  private readonly _httpClient: HttpClient = inject(HttpClient);


  getRecurringTasksByUserId(userId: number): Observable<RecurringTask[]> {
    return this._httpClient.get<RecurringTask[]>(this._serviceUrl + userId);
  }

  insertRecurringTask(recurringTask: RecurringTask): Observable<RecurringTask> {
    return this._httpClient.post<RecurringTask>(this._serviceUrl, recurringTask);
  }

  updateRecurringTask(recurringTask: RecurringTask): Observable<RecurringTask> {
    return this._httpClient.put<RecurringTask>(this._serviceUrl + recurringTask.id, recurringTask);
  }

  deleteRecurringTask(recurringTaskId: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(this._serviceUrl + recurringTaskId);
  }
}
