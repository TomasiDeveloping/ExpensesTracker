import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {RevenueCategoryModel} from "../../models/revenueCategory.model";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";

@Component({
  selector: 'app-revenue-category-edit-dialog',
  templateUrl: './revenue-category-edit-dialog.component.html',
  styleUrls: ['./revenue-category-edit-dialog.component.css']
})
export class RevenueCategoryEditDialogComponent implements OnInit {
  isUpdate: boolean;
  currentRevenueCategory: RevenueCategoryModel;
  // @ts-ignore
  revenueCategoryForm: UntypedFormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private revenueCategoryService: RevenueCategoryService,
              private toastr: ToastrService,
              private dialogRef: MatDialogRef<RevenueCategoryEditDialogComponent>) {
    this.isUpdate = data.isUpdate;
    this.currentRevenueCategory = data.revenueCategory;
  }

  ngOnInit(): void {
    this.revenueCategoryForm = new UntypedFormGroup({
      id: new UntypedFormControl(this.currentRevenueCategory.id),
      name: new UntypedFormControl(this.currentRevenueCategory.name, [Validators.required]),
      userId: new UntypedFormControl(this.currentRevenueCategory.userId)
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.revenueCategoryForm.invalid) {
      return;
    }
    const revenueCategory: RevenueCategoryModel = this.revenueCategoryForm.value as RevenueCategoryModel;
    if (revenueCategory.id > 0) {
      this.updateRevenueCategory(revenueCategory);
    } else {
      this.addRevenueCategory(revenueCategory);
    }
  }

  private updateRevenueCategory(revenueCategory: RevenueCategoryModel) {
    this.revenueCategoryService.updateRevenueCategory(revenueCategory.id, revenueCategory).subscribe({
      next: ((response) => {
        this.dialogRef.close('update');
        this.toastr.success(response.name + ' erfolgreich bearbeitet', 'Bearbeiten');
      }),
      error: (error) => {
        Swal.fire('Bearbeiten', 'Error ' + error.error, 'error').then();
      }
    });
  }

  private addRevenueCategory(revenueCategory: RevenueCategoryModel) {
    this.revenueCategoryService.insertRevenueCategory(revenueCategory).subscribe({
      next: ((response) => {
        this.dialogRef.close('update');
        this.toastr.success(response.name + ' hinzugefügt', 'Hinzugefügt');
      }),
      error: (error) => {
        Swal.fire('Hinzugefügt', 'Error ' + error.error, 'error').then();
      }
    });
  }
}
