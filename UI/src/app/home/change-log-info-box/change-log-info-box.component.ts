import {Component, inject, Inject} from '@angular/core';
import {ApplicationVersionConfirmationService} from "../../services/application-version-confirmation.service";
import {ApplicationVersionConfirmation} from "../../models/applicationVersionConfirmation.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-change-log-info-box',
  templateUrl: './change-log-info-box.component.html',
  styleUrls: ['./change-log-info-box.component.css']
})
export class ChangeLogInfoBoxComponent {

  public version: string;
  private readonly _currentUserId: number;
  private readonly _matDialogRef: MatDialogRef<HashChangeEvent> = inject(MatDialogRef<ChangeLogInfoBoxComponent>);
  private readonly _applicationVersionConfirmationService: ApplicationVersionConfirmationService = inject(ApplicationVersionConfirmationService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this._currentUserId = data.userId;
    this.version = data.version;
  }


  onOk(): void {
    const applicationVersionConfirmation: ApplicationVersionConfirmation = {
      userId: this._currentUserId,
      version: this.version
    }
    this._applicationVersionConfirmationService.insertApplicationVersionConfirmation(applicationVersionConfirmation).subscribe();
    this._matDialogRef.close();
  }
}
