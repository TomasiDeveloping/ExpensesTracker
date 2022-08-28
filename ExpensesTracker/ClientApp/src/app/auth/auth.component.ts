import {Component, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";
import {RegisterComponent} from "./register/register.component";
import {ForgotPasswordComponent} from "./forgot-password/forgot-password.component";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  // @ts-ignore
  loginForm: UntypedFormGroup
  fieldTextType: Boolean = false;
  currentYear = new Date().getFullYear();

  constructor(private authService: AuthService,
              private toastr: ToastrService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = new UntypedFormGroup({
      email: new UntypedFormControl(null, [Validators.required, Validators.email]),
      password: new UntypedFormControl(null, [Validators.required]),
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.toastr.error('Fehler im Eingabefeld', 'Login');
      return;
    }
    this.authService.login(this.loginForm.controls.email.value, this.loginForm.controls.password.value);
  }

  onForgotPassword() {
    this.dialog.open(ForgotPasswordComponent, {
      width: '100%',
      height: 'auto',
      autoFocus: false
    });
  }

  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  onRegister() {
    this.dialog.open(RegisterComponent, {
      width: '100%',
      height: 'auto',
      autoFocus: false
    });
  }

  onFooter() {
    window.open('https://tomasi-developing.ch');
  }
}
