import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SupportContactModel} from "../../models/supportContact.model";
import {UsersService} from "../../services/users.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";

@Component({
  selector: 'app-contact-support',
  templateUrl: './contact-support.component.html',
  styleUrls: ['./contact-support.component.css']
})
export class ContactSupportComponent implements OnInit {

  // @ts-ignore
  supportForm: UntypedFormGroup;
  isError = false;
  userEmail: string;
  subjects: string[] = ['Fehlermeldung', 'Wunsch', 'Allgemeine Anfrage'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private userService: UsersService,
              private dialogRef: MatDialogRef<ContactSupportComponent>,
              private toastr: ToastrService) {
    this.userEmail = data.email;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.supportForm =  new UntypedFormGroup({
      email: new UntypedFormControl(this.userEmail, [Validators.required, Validators.email]),
      subject: new UntypedFormControl(null, [Validators.required]),
      message: new UntypedFormControl(null, [Validators.required]),
      describeBug: new UntypedFormControl(null),
      stepToReproduce: new UntypedFormControl(null),
      expectedBehavior: new UntypedFormControl(null)
    });
  }

  submit() {
    let supportMessage: SupportContactModel = this.supportForm.value as SupportContactModel;
    if (this.isError) {
      let message = 'Fehlerbeschreibung:\n' + this.supportForm.controls.describeBug.value + '\n\n';
      message += 'Schritte zur Reproduzierung:\n' + this.supportForm.controls.stepToReproduce.value + '\n\n';
      message += 'Erwartetes Resultat:\n ' + this.supportForm.controls.expectedBehavior.value + '\n\n';
      supportMessage = this.supportForm.value as SupportContactModel;
      supportMessage.message = message;
    }
    this.userService.sendSupportMail(supportMessage).subscribe({
      next: ((response) => {
        if (response) {
          this.toastr.success('Deine Nachricht wurde an den Support gesendet', 'Support');
          this.dialogRef.close();
        } else {
          Swal.fire('Support', 'Deine E-Mail konnte nicht versendet werden', 'error').then(() => {
            this.dialogRef.close();
          })
        }
      }),
      error: (error) => {
        Swal.fire('Support', error.error, 'error').then(() => this.dialogRef.close());
      }
    });
  }

  onSelectChange(event: any) {
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
