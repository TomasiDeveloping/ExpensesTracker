import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import {UserModel} from "../models/user.model";
import {SupportContactModel} from "../models/supportContact.model";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly _serviceUrl: string = environment.apiUrl + 'users/';
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private userWithRevenue: boolean = false;

  getWithRevenue(): boolean {
    return this.userWithRevenue;
  }

  getUserById(userId: number): Observable<UserModel> {
    return this._httpClient.get<UserModel>(this._serviceUrl + userId)
      .pipe(tap(response => {
        this.userWithRevenue = response.withRevenue;
      }));
  }

  updateUser(userId: number, user: UserModel): Observable<UserModel> {
    return this._httpClient.put<UserModel>(this._serviceUrl + userId, user);
  }

  changeUserPassword(userId: number, newPassword: string): Observable<boolean> {
    return this._httpClient.put<boolean>(this._serviceUrl + userId + '/changeUserPassword', {newPassword});
  }

  deleteUser(userId: number): Observable<boolean> {
    return this._httpClient.delete<boolean>(this._serviceUrl + userId);
  }

  sendSupportMail(supportContact: SupportContactModel): Observable<boolean> {
    return this._httpClient.post<boolean>(this._serviceUrl + 'SendSupportEmail', supportContact);
  }
}
