import {Component, OnInit} from '@angular/core';
import {CategoriesService} from "../services/categories.service";
import {CategoryModel} from "../models/category.model";
import Swal from 'sweetalert2';
import {ToastrService} from "ngx-toastr";
import {MatDialog} from "@angular/material/dialog";
import {CategoryEditDialogComponent} from "./category-edit-dialog/category-edit-dialog.component";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  userCategories: CategoryModel[] = [];
  currentUserId = 0;

  constructor(private categoryService: CategoriesService,
              private authService: AuthService,
              private toastr: ToastrService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
    }
    this.getUserCategories();
  }

  getUserCategories() {
    this.categoryService.getUserCategories(this.currentUserId).subscribe((response) => {
      this.userCategories = response;
    });
  }

  onAddCategory() {
    const category: CategoryModel = new class implements CategoryModel {
      id = 0;
      name = '';
      userId = 0
    };
    category.userId = this.currentUserId;
    this.openDialog(category, false);
  }

  onEdit(category: CategoryModel) {
    this.openDialog(category, true);
  }

  openDialog(category: CategoryModel, isUpdate: boolean) {
    const dialogRef = this.dialog.open(CategoryEditDialogComponent, {
      width: '80%',
      height: 'auto',
      data: {category: category, isUpdate: isUpdate}
    });
    dialogRef.afterClosed().subscribe((response) => {
      if (response === 'update') {
        this.getUserCategories();
      }
    });
  }

  onDelete(category: CategoryModel) {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Kategorie <b>' + category.name + '</b> wirklich löschen ?</p><p>Alle Ausgaben für die Kategorie werden ebenfalls gelöscht!</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte löschen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteCategory(category);
      }
    })
  }

  private deleteCategory(category: CategoryModel) {
    this.categoryService.deleteCategory(category.id).subscribe({
      next: ((response) => {
        if (response) {
          this.getUserCategories();
          this.toastr.success(category.name + ' gelöscht', 'Löschen');
        } else {
        }
      }),
      error: (error) => {
        Swal.fire('Löschen', 'Error ' + error.error, 'error').then();
      }
    });
  }
}
