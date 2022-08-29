import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RecurringTask} from "../models/recurringTask.model";

@Injectable({
  providedIn: 'root'
})
export class RecurringTaskService {

  serviceUrl = environment.apiUrl + 'recurringTask/';

  constructor(private readonly http: HttpClient) { }

  getRecurringTasksByUserId(userId: number): Observable<RecurringTask[]> {
    return this.http.get<RecurringTask[]>(this.serviceUrl + userId);
  }

  insertRecurringTask(recurringTask: RecurringTask): Observable<RecurringTask> {
    return this.http.post<RecurringTask>(this.serviceUrl, recurringTask);
  }

  updateRecurringTask(recurringTask: RecurringTask): Observable<RecurringTask> {
    return this.http.put<RecurringTask>(this.serviceUrl + recurringTask.id, recurringTask);
  }

  deleteRecurringTask(recurringTaskId: number): Observable<boolean> {
    return this.http.delete<boolean>(this.serviceUrl + recurringTaskId);
  }
}
