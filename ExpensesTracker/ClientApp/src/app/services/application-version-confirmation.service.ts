import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApplicationVersionConfirmation} from "../models/applicationVersionConfirmation.model";

@Injectable({
  providedIn: 'root'
})
export class ApplicationVersionConfirmationService {

  private readonly _serviceUrl = environment.apiUrl + 'applicationVersionConfirmation/';
  private readonly _httpClient = inject(HttpClient);

  checkUserHasConfirmed(userId: number, version: string): Observable<boolean> {
    const applicationVersionConfirmation: ApplicationVersionConfirmation = {
      userId: userId,
      version: version
    };
    return this._httpClient.post<boolean>(this._serviceUrl + 'UserHasVersionConfirmed', applicationVersionConfirmation);
  }

  insertApplicationVersionConfirmation(applicationVersionConfirmation: ApplicationVersionConfirmation): Observable<ApplicationVersionConfirmation> {
    return this._httpClient.post<ApplicationVersionConfirmation>(this._serviceUrl, applicationVersionConfirmation);
  }
}
