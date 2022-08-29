import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApplicationVersionConfirmation} from "../models/applicationVersionConfirmation.model";

@Injectable({
  providedIn: 'root'
})
export class ApplicationVersionConfirmationService {

  serviceUrl = environment.apiUrl + 'applicationVersionConfirmation/';

  constructor(private readonly http: HttpClient) { }

  checkUserHasConfirmed(userId: number, version: string): Observable<boolean> {
    const applicationVersionConfirmation: ApplicationVersionConfirmation = {
      userId: userId,
      version: version
    };
    return this.http.post<boolean>(this.serviceUrl + 'UserHasVersionConfirmed', applicationVersionConfirmation);
  }

  insertApplicationVersionConfirmation(applicationVersionConfirmation: ApplicationVersionConfirmation): Observable<ApplicationVersionConfirmation> {
    return this.http.post<ApplicationVersionConfirmation>(this.serviceUrl, applicationVersionConfirmation);
  }
}
