import {Component, inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {ToastrService} from "ngx-toastr";
import {RegisterComponent} from "./register/register.component";
import {ForgotPasswordComponent} from "./forgot-password/forgot-password.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  public loginForm!: FormGroup;
  public fieldTextType: boolean = false;
  public currentYear: number = new Date().getFullYear();

  private readonly _authService: AuthService = inject(AuthService);
  private readonly _toastr: ToastrService = inject(ToastrService);
  private readonly _dialog: MatDialog = inject(MatDialog);


  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      password: new FormControl<string>('', [Validators.required]),
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this._toastr.error('Fehler im Eingabefeld', 'Login');
      return;
    }
    this._authService.login(this.email.value, this.password.value);
  }

  onForgotPassword(): void {
    this._dialog.open(ForgotPasswordComponent, {
      width: '100%',
      height: 'auto',
      autoFocus: false
    });
  }

  toggleFieldTextType(): void {
    this.fieldTextType = !this.fieldTextType;
  }

  onRegister(): void {
    this._dialog.open(RegisterComponent, {
      width: '100%',
      height: 'auto',
      autoFocus: false
    });
  }

  onFooter(): void {
    window.open('https://tomasi-developing.ch');
  }
}
