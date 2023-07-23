import {inject, Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {BehaviorSubject, map, Observable} from "rxjs";
import {AppUser} from "../models/appUser.model";
import {HttpClient} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {UsersService} from "./users.service";
import Swal from "sweetalert2";
import * as jwt_decode from "jwt-decode";
import {RegisterModel} from "../models/register.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUserSource = new BehaviorSubject<AppUser | null>(null);
  private readonly _serviceUrl = environment.apiUrl + 'auth/';
  private readonly _httpClient = inject(HttpClient);
  private readonly _toastr = inject(ToastrService);
  private readonly _userService = inject(UsersService);


  get userIsAuthenticated() {
    return this.currentUserSource.asObservable().pipe(map(appUser => {
      if (appUser) {
        return !!appUser.token;
      }
      return false;
    }));
  }

  private static setUserData(appUser: AppUser) {
    localStorage.setItem('expenseToken', appUser.token);
  }

  private static removeUserData() {
    localStorage.removeItem('expenseToken');
  }

  getUserIdFromToken(): number {
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      return +decodeToken.nameid;
    } else {
      return 0;
    }
  }

  login(email: string, password: string) {
    this._httpClient.post<AppUser>(this._serviceUrl + 'Login', {email, password}).subscribe({
      next: ((response) => {
        this.currentUserSource.next(response);
        AuthService.setUserData(response);
      }),
      error: (error) => {
        this._toastr.error(error.error, 'Login');
      }
    });
  }

  register(register: RegisterModel) {
    this._httpClient.post<AppUser>(this._serviceUrl + 'Register', register).subscribe({
      next: ((response) => {
        this.currentUserSource.next(response);
        AuthService.setUserData(response);
      }),
      error: (error) => {
        this._toastr.error(error.error, 'Registrieren')
      }
    })
  }

  autoLogin() {
    const token = localStorage.getItem('expenseToken');
    if (token) {
      const decodeToken: { email: string, nameid: string, exp: number } = jwt_decode.default(token);
      const expiryDate = new Date(decodeToken.exp * 1000);
      if (expiryDate < new Date()) {
        Swal.fire('Session', 'Die Sitzung ist abgelaufen, bitte melden Sie sich erneut an', 'info')
          .then(() => this.logout());
      }
      const userId = +decodeToken.nameid;
      this._userService.getUserById(userId).subscribe(response => {
        const appUser: AppUser = new class implements AppUser {
          userId = response.id;
          token = token ? token : '';
          firstName = response.firstName
        }
        this.currentUserSource.next(appUser);
      });
    }
  }

  // checkEmailIfExists(email: string): Observable<boolean> {
  //   let params = new HttpParams();
  //   params = params.set('email', email);
  //   return this.http.get<boolean>(this.apiUrl + 'CheckEmailExists', {params: params});
  // }

  logout() {
    AuthService.removeUserData();
    this.currentUserSource.next(null);
  }

  forgotPassword(email: string): Observable<boolean> {
    return this._httpClient.post<boolean>(this._serviceUrl + 'forgotPassword', {email: email});
  }
}
