import {Component, inject, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SupportContactModel} from "../../models/supportContact.model";
import {UsersService} from "../../services/users.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-contact-support',
  templateUrl: './contact-support.component.html',
  styleUrls: ['./contact-support.component.css']
})
export class ContactSupportComponent implements OnInit {

  public supportForm!: FormGroup;
  public isError: boolean = false;
  public subjects: string[] = ['Fehlermeldung', 'Wunsch', 'Allgemeine Anfrage'];

  private readonly _userEmail: string;
  private readonly _userService: UsersService = inject(UsersService);
  private readonly _dialogRef: MatDialogRef<ContactSupportComponent> = inject(MatDialogRef<ContactSupportComponent>);
  private readonly _toastr: ToastrService = inject(ToastrService);


  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this._userEmail = data.email;
  }

  get email() {
    return this.supportForm.get('email')!;
  }

  get subject() {
    return this.supportForm.get('subject')!;
  }

  get message() {
    return this.supportForm.get('message')!;
  }

  get describeBug() {
    return this.supportForm.get('describeBug')!;
  }

  get stepToReproduce() {
    return this.supportForm.get('stepToReproduce')!;
  }

  get expectedBehavior() {
    return this.supportForm.get('expectedBehavior')!;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.supportForm = new FormGroup({
      email: new FormControl<string>(this._userEmail, [Validators.required, Validators.email]),
      subject: new FormControl<string>('', [Validators.required]),
      message: new FormControl<string>('', [Validators.required]),
      describeBug: new FormControl<string>(''),
      stepToReproduce: new FormControl<string>(''),
      expectedBehavior: new FormControl<string>('')
    });
  }

  submit(): void {
    let supportMessage: SupportContactModel = this.supportForm.value as SupportContactModel;
    if (this.isError) {
      let message = 'Fehlerbeschreibung:\n' + this.supportForm.controls.describeBug.value + '\n\n';
      message += 'Schritte zur Reproduzierung:\n' + this.supportForm.controls.stepToReproduce.value + '\n\n';
      message += 'Erwartetes Resultat:\n ' + this.supportForm.controls.expectedBehavior.value + '\n\n';
      supportMessage = this.supportForm.value as SupportContactModel;
      supportMessage.message = message;
    }
    this._userService.sendSupportMail(supportMessage).subscribe({
      next: ((response) => {
        if (response) {
          this._toastr.success('Deine Nachricht wurde an den Support gesendet', 'Support');
          this._dialogRef.close();
        } else {
          Swal.fire('Support', 'Deine E-Mail konnte nicht versendet werden', 'error').then(() => {
            this._dialogRef.close();
          })
        }
      }),
      error: (error) => {
        Swal.fire('Support', error.error, 'error').then(() => this._dialogRef.close());
      }
    });
  }

  onSelectChange(event: any): void {
    if (event.target.value.includes('Fehlermeldung')) {
      this.isError = true;
      this.supportForm.controls.message.clearValidators();
      this.supportForm.controls.message.updateValueAndValidity();
      this.supportForm.controls.describeBug.setValidators([Validators.required]);
      this.supportForm.controls.describeBug.updateValueAndValidity();
      this.supportForm.controls.stepToReproduce.setValidators([Validators.required]);
      this.supportForm.controls.stepToReproduce.updateValueAndValidity();
      this.supportForm.controls.expectedBehavior.setValidators([Validators.required]);
      this.supportForm.controls.expectedBehavior.updateValueAndValidity();
    } else {
      this.isError = false;
      this.supportForm.controls.message.setValidators([Validators.required]);
      this.supportForm.controls.message.updateValueAndValidity();
      this.supportForm.controls.describeBug.clearValidators();
      this.supportForm.controls.describeBug.updateValueAndValidity();
      this.supportForm.controls.stepToReproduce.clearValidators();
      this.supportForm.controls.stepToReproduce.updateValueAndValidity();
      this.supportForm.controls.expectedBehavior.clearValidators();
      this.supportForm.controls.expectedBehavior.updateValueAndValidity();
    }
  }
}
