import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {BehaviorSubject, map, Observable} from "rxjs";
import {AppUser} from "../models/appUser.model";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";
import {UsersService} from "./users.service";
import Swal from "sweetalert2";
import * as jwt_decode from "jwt-decode";
import {RegisterModel} from "../models/register.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  serviceUrl = environment.apiUrl + 'auth/';
  currentUserSource = new BehaviorSubject<AppUser | null>(null);

  constructor(private http: HttpClient,
              private toastr: ToastrService,
              private userService: UsersService) {
  }

  get userIsAuthenticated() {
    return this.currentUserSource.asObservable().pipe(map(appUser => {
      if (appUser) {
        return !!appUser.token;
      }
      return false;
    }));
  }

  get currentUser() {
    return this.currentUserSource.asObservable();
  }

  private static setUserData(appUser: AppUser) {
    localStorage.setItem('expenseToken', appUser.token);
  }

  private static removeUserData() {
    localStorage.removeItem('expenseToken');
  }

  login(email: string, password: string) {
    this.http.post<AppUser>(this.serviceUrl + 'Login', {email, password}).subscribe(response => {
      this.currentUserSource.next(response);
      AuthService.setUserData(response);
    }, error => {
      this.toastr.error(error.error, 'Login');
    });
  }

  register(register: RegisterModel) {
    this.http.post<AppUser>(this.serviceUrl + 'Register', register).subscribe(response => {
      this.currentUserSource.next(response);
      AuthService.setUserData(response);
    }, error => {
      this.toastr.error(error.error, 'Registrieren')
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
      this.userService.getUserById(userId).subscribe(response => {
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
    return this.http.post<boolean>(this.serviceUrl + 'forgotPassword', {email: email});
  }
}
