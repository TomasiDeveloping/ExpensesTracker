import {Component, inject, OnInit} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {RegisterModel} from "../../models/register.model";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public registerForm!: FormGroup;

  private _dialogRef = inject(MatDialogRef<RegisterComponent>);
  private readonly _authService = inject(AuthService);


  get email() {
    return this.registerForm.get('email')!;
  }

  get firstName() {
    return this.registerForm.get('firstName')!;
  }

  get lastName() {
    return this.registerForm.get('lastName')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  ngOnInit(): void {
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = new FormGroup({
      email: new FormControl<string>('', [Validators.required, Validators.email, Validators.maxLength(100)]),
      password: new FormControl<string>('', [Validators.required]),
      confirmPassword: new FormControl<string>('', [Validators.required, this.matchValues('password')]),
      firstName: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
      lastName: new FormControl<string>('', [Validators.required, Validators.maxLength(100)])
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      return;
    }
    this._dialogRef.close();
    const register: RegisterModel = this.registerForm.value as RegisterModel;
    this._authService.register(register);
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      // @ts-ignore
      return control?.value === control?.parent?.controls[matchTo].value
        ? null : {isMatching: true};
    };
  }


  onClose() {
    this._dialogRef.close();
  }
}
