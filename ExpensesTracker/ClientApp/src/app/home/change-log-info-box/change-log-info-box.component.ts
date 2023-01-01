import {Component, Inject, OnInit} from '@angular/core';
import {ApplicationVersionConfirmationService} from "../../services/application-version-confirmation.service";
import {ApplicationVersionConfirmation} from "../../models/applicationVersionConfirmation.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-change-log-info-box',
  templateUrl: './change-log-info-box.component.html',
  styleUrls: ['./change-log-info-box.component.css']
})
export class ChangeLogInfoBoxComponent implements OnInit {

  version: string;
  currentUserId: number;

  constructor(private matDialogRef: MatDialogRef<ChangeLogInfoBoxComponent>,
              private applicationVersionConfirmationService: ApplicationVersionConfirmationService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.currentUserId = data.userId;
    this.version = data.version;
  }

  ngOnInit(): void {
  }

  onOk() {
    const applicationVersionConfirmation: ApplicationVersionConfirmation = {
      userId: this.currentUserId,
      version: this.version
    }
    this.applicationVersionConfirmationService.insertApplicationVersionConfirmation(applicationVersionConfirmation).subscribe();
    this.matDialogRef.close();
  }
}
