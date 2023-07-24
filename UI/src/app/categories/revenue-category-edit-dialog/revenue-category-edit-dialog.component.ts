import {Component, inject, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RevenueCategoryModel} from "../../models/revenueCategory.model";
import {RevenueCategoryService} from "../../services/revenue-category.service";
import {ToastrService} from "ngx-toastr";
import Swal from "sweetalert2";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-revenue-category-edit-dialog',
  templateUrl: './revenue-category-edit-dialog.component.html',
  styleUrls: ['./revenue-category-edit-dialog.component.css']
})
export class RevenueCategoryEditDialogComponent implements OnInit {

  public isUpdate: boolean;
  public currentRevenueCategory: RevenueCategoryModel;
  public revenueCategoryForm!: FormGroup;

  private readonly _revenueCategoryService: RevenueCategoryService = inject(RevenueCategoryService);
  private readonly _toastr: ToastrService = inject(ToastrService);
  private readonly _dialogRef: MatDialogRef<RevenueCategoryEditDialogComponent> = inject(MatDialogRef<RevenueCategoryEditDialogComponent>)

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isUpdate = data.isUpdate;
    this.currentRevenueCategory = data.revenueCategory;
  }

  get name() {
    return this.revenueCategoryForm.get('name')!;
  }

  ngOnInit(): void {
    this.revenueCategoryForm = new FormGroup({
      id: new FormControl<number>(this.currentRevenueCategory.id),
      name: new FormControl<string>(this.currentRevenueCategory.name, [Validators.required]),
      userId: new FormControl<number>(this.currentRevenueCategory.userId)
    });
  }

  onClose(): void {
    this._dialogRef.close();
  }

  onSubmit(): void {
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

  private updateRevenueCategory(revenueCategory: RevenueCategoryModel): void {
    this._revenueCategoryService.updateRevenueCategory(revenueCategory.id, revenueCategory).subscribe({
      next: ((response) => {
        this._dialogRef.close('update');
        this._toastr.success(response.name + ' erfolgreich bearbeitet', 'Bearbeiten');
      }),
      error: (error) => {
        Swal.fire('Bearbeiten', 'Error ' + error.error, 'error').then();
      }
    });
  }

  private addRevenueCategory(revenueCategory: RevenueCategoryModel): void {
    this._revenueCategoryService.insertRevenueCategory(revenueCategory).subscribe({
      next: ((response) => {
        this._dialogRef.close('update');
        this._toastr.success(response.name + ' hinzugefügt', 'Hinzugefügt');
      }),
      error: (error) => {
        Swal.fire('Hinzugefügt', 'Error ' + error.error, 'error').then();
      }
    });
  }
}
