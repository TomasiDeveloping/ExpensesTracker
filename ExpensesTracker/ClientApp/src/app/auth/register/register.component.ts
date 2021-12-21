import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../services/auth.service";
import {RegisterModel} from "../../models/register.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  // @ts-ignore
  registerForm: FormGroup;

  constructor(private dialogRef: MatDialogRef<RegisterComponent>,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = new FormGroup({
     // email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(100)], this.validateEmailNotTaken()),
      email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(100)]),
      password: new FormControl(null, [Validators.required]),
      confirmPassword: new FormControl(null, [Validators.required, this.matchValues('password')]),
      firstName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      lastName: new FormControl(null, [Validators.required, Validators.maxLength(100)])
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      return;
    }
    this.dialogRef.close();
    const register: RegisterModel = this.registerForm.value as RegisterModel;
    this.authService.register(register);
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      // @ts-ignore
      return control?.value === control?.parent?.controls[matchTo].value
        ? null : {isMatching: true};
    };
  }

  // validateEmailNotTaken(): AsyncValidatorFn {
  //   return control => {
  //     return timer(500).pipe(
  //       switchMap(() => {
  //         if (!control.value) {
  //           return of(null);
  //         }
  //         return this.authService.checkEmailIfExists(control.value).pipe(
  //           map(res => {
  //             return res ? {emailExists: true} : null;
  //           })
  //         );
  //       })
  //     );
  //   };
  // }
  onClose() {
    this.dialogRef.close();
  }
}
