import {Component, Inject, OnInit} from '@angular/core';
import {CategoryModel} from "../../models/category.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CategoriesService} from "../../services/categories.service";
import {ToastrService} from "ngx-toastr";
import {UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import Swal from "sweetalert2";

@Component({
  selector: 'app-category-edit-dialog',
  templateUrl: './category-edit-dialog.component.html',
  styleUrls: ['./category-edit-dialog.component.css']
})
export class CategoryEditDialogComponent implements OnInit {

  currentCategory: CategoryModel;
  isUpdate: boolean;
  // @ts-ignore
  categoryForm: UntypedFormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private categoryService: CategoriesService,
              private toastr: ToastrService,
              private dialogRef: MatDialogRef<CategoryEditDialogComponent>) {
    this.currentCategory = data.category;
    this.isUpdate = data.isUpdate;
  }

  ngOnInit(): void {
    this.categoryForm = new UntypedFormGroup({
      id: new UntypedFormControl(this.currentCategory.id),
      name: new UntypedFormControl(this.currentCategory.name, [Validators.required]),
      userId: new UntypedFormControl(this.currentCategory.userId)
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }
    const category: CategoryModel = this.categoryForm.value as CategoryModel;
    if (category.id > 0) {
      this.updateCategory(category);
    } else {
      this.addCategory(category);
    }
  }

  private updateCategory(category: CategoryModel) {
    this.categoryService.updateCategory(category.id, category).subscribe({
      next: ((response) => {
        this.dialogRef.close('update');
        this.toastr.success(response.name + ' erfolgreich bearbeitet', 'Bearbeiten');
      }),
      error: (error) => {
        Swal.fire('Bearbeiten', 'Error ' + error.error, 'error').then();
      }
    });
  }

  private addCategory(category: CategoryModel) {
    this.categoryService.insertCategory(category).subscribe({
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
