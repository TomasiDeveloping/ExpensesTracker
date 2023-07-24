import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import Swal from "sweetalert2";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  public forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email])
  });

  private readonly _authService: AuthService = inject(AuthService);
  private _dialogRef: MatDialogRef<ForgotPasswordComponent> = inject(MatDialogRef<ForgotPasswordComponent>);


  get email() {
    return this.forgotPasswordForm.get('email')!;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      Swal.fire('Passwort vergessen', 'Bitte prüfe deine Eingaben', 'error').then();
    }
    this._authService.forgotPassword(this.forgotPasswordForm.controls.email.value).subscribe({
      next: ((response) => {
        if (response) {
          Swal.fire('Passwort vergessen',
            `Neues Passwort wurde an ${this.forgotPasswordForm.controls.email.value} gesendet. Bitte prüfe auch dein Spam- Ordner`,
            'success').then(() => this.onClose());
        } else {
          Swal.fire('Passwort vergessen',
            'Neues Passwort konnte nicht gesendet werden. Bitte melde Dich beim Support',
            'error').then(() => this.onClose());
        }
      }),
      error: (error) => {
        Swal.fire('Passwort vergessen', error.error, 'error').then();
      }
    });
  }

  onClose(): void {
    this._dialogRef.close();
  }
}
