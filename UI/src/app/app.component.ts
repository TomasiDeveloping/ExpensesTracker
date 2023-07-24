import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {AuthService} from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  public isLogin: boolean = false;

  private userSub$: Subscription | undefined;

  private readonly _authService: AuthService = inject(AuthService);

  ngOnInit(): void {
    this._authService.autoLogin();
    this.userSub$ = this._authService.userIsAuthenticated.subscribe(isAuth => {
      this.isLogin = isAuth;
    });
  }

  ngOnDestroy(): void {
    if (this.userSub$) {
      this.userSub$.unsubscribe();
    }
  }
}
