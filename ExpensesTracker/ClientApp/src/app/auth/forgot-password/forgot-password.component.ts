import {Component, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../services/auth.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: UntypedFormGroup = new UntypedFormGroup({
    email: new UntypedFormControl('', [Validators.required, Validators.email])
  });

  constructor(private dialogRef: MatDialogRef<ForgotPasswordComponent>,
              private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      Swal.fire('Passwort vergessen', 'Bitte prüfe deine Eingaben', 'error').then();
    }
    this.authService.forgotPassword(this.forgotPasswordForm.controls.email.value).subscribe({
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

  onClose() {
    this.dialogRef.close();
  }
}
