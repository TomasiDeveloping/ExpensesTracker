import {Component, inject, Inject, OnInit} from '@angular/core';
import {CategoryModel} from "../../models/category.model";
import {CategoriesService} from "../../services/categories.service";
import {ToastrService} from "ngx-toastr";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import Swal from "sweetalert2";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-category-edit-dialog',
  templateUrl: './category-edit-dialog.component.html',
  styleUrls: ['./category-edit-dialog.component.css']
})
export class CategoryEditDialogComponent implements OnInit {

  public currentCategory: CategoryModel;
  public isUpdate: boolean;
  public categoryForm!: FormGroup;

  private readonly _categoryService = inject(CategoriesService);
  private readonly _toastr = inject(ToastrService);
  private readonly _dialogRef = inject(MatDialogRef<CategoryEditDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.currentCategory = data.category;
    this.isUpdate = data.isUpdate;
  }

  get name() {
    return this.categoryForm.get('name')!;
  }

  ngOnInit(): void {
    this.categoryForm = new FormGroup({
      id: new FormControl<number>(this.currentCategory.id),
      name: new FormControl<string>(this.currentCategory.name, [Validators.required]),
      userId: new FormControl<number>(this.currentCategory.userId)
    });
  }

  onClose() {
    this._dialogRef.close();
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
    this._categoryService.updateCategory(category.id, category).subscribe({
      next: ((response) => {
        this._dialogRef.close('update');
        this._toastr.success(response.name + ' erfolgreich bearbeitet', 'Bearbeiten');
      }),
      error: (error) => {
        Swal.fire('Bearbeiten', 'Error ' + error.error, 'error').then();
      }
    });
  }

  private addCategory(category: CategoryModel) {
    this._categoryService.insertCategory(category).subscribe({
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
