import {Component, inject, OnInit} from '@angular/core';
import {CategoriesService} from "../services/categories.service";
import {CategoryModel} from "../models/category.model";
import Swal from 'sweetalert2';
import {ToastrService} from "ngx-toastr";
import {CategoryEditDialogComponent} from "./category-edit-dialog/category-edit-dialog.component";
import {AuthService} from "../services/auth.service";
import {RevenueCategoryModel} from "../models/revenueCategory.model";
import {RevenueCategoryService} from "../services/revenue-category.service";
import {
  RevenueCategoryEditDialogComponent
} from "./revenue-category-edit-dialog/revenue-category-edit-dialog.component";
import {UsersService} from "../services/users.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  public userCategories: CategoryModel[] = [];
  public userRevenueCategories: RevenueCategoryModel[] = [];
  public isUserWithRevenue: boolean = false;

  private currentUserId: number = 0;

  private readonly _categoryService: CategoriesService = inject(CategoriesService);
  private readonly _revenueCategoryService: RevenueCategoryService = inject(RevenueCategoryService);
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _userService: UsersService = inject(UsersService);
  private readonly _toastr: ToastrService = inject(ToastrService);
  private readonly _dialog: MatDialog = inject(MatDialog);


  ngOnInit(): void {
    this.currentUserId = this._authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this._authService.logout();
    }
    this.isUserWithRevenue = this._userService.getWithRevenue();
    this.getUserCategories();
    if (this.isUserWithRevenue) {
      this.getUserRevenueCategories();
    }
  }

  getUserCategories(): void {
    this._categoryService.getUserCategories(this.currentUserId).subscribe((response) => {
      this.userCategories = response;
    });
  }

  getUserRevenueCategories(): void {
    this._revenueCategoryService.getUserRevenueCategories(this.currentUserId).subscribe({
      next: ((response) => {
        this.userRevenueCategories = response;
      })
    });
  }

  onAddCategory(): void {
    const category: CategoryModel = new class implements CategoryModel {
      id = 0;
      name = '';
      userId = 0
    };
    category.userId = this.currentUserId;
    this.openDialog(category, false);
  }

  onEdit(category: CategoryModel): void {
    this.openDialog(category, true);
  }

  openDialog(category: CategoryModel, isUpdate: boolean): void {
    const dialogRef = this._dialog.open(CategoryEditDialogComponent, {
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

  openRevenueDialog(revenueCategory: RevenueCategoryModel, isUpdate: boolean): void {
    const dialogRef = this._dialog.open(RevenueCategoryEditDialogComponent, {
      width: '80%',
      height: 'auto',
      data: {revenueCategory: revenueCategory, isUpdate: isUpdate}
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response === 'update') {
        this.getUserRevenueCategories();
      }
    });
  }

  onDelete(category: CategoryModel): void {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Kategorie <b>' + category.name + '</b> wirklich löschen ?</p><p>Alle Ausgaben und Daueraufträge für die Kategorie werden ebenfalls gelöscht!</p>',
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

  onEditRevenue(category: RevenueCategoryModel): void {
    this.openRevenueDialog(category, true);
  }

  onDeleteDeleteRevenue(category: RevenueCategoryModel): void {
    Swal.fire({
      title: 'Bist Du sicher ?',
      html: '<p>Kategorie <b>' + category.name + '</b> wirklich löschen ?</p><p>Alle Einnahmen und Daueraufträge für die Kategorie werden ebenfalls gelöscht!</p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ja, bitte löschen',
      cancelButtonText: 'Abbrechen'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRevenueCategory(category);
      }
    })
  }

  onAddRevenueCategory(): void {
    const revenueCategory: RevenueCategoryModel = new class implements RevenueCategoryModel {
      id = 0;
      name = '';
      userId = 0;
    };
    revenueCategory.userId = this.currentUserId;
    this.openRevenueDialog(revenueCategory, false);
  }

  private deleteCategory(category: CategoryModel): void {
    this._categoryService.deleteCategory(category.id).subscribe({
      next: ((response) => {
        if (response) {
          this.getUserCategories();
          this._toastr.success(category.name + ' gelöscht', 'Löschen');
        }
      }),
      error: (error) => {
        Swal.fire('Löschen', 'Error ' + error.error, 'error').then();
      }
    });
  }

  private deleteRevenueCategory(category: RevenueCategoryModel): void {
    this._revenueCategoryService.deleteRevenueCategory(category.id).subscribe({
      next: ((response) => {
        if (response) {
          this.getUserRevenueCategories();
          this._toastr.success(category.name + ' wurde gelöscht', 'Löschen');
        } else {
          Swal.fire('Löschen', category.name + ' konnte nicht gelöscht werden', 'error').then();
        }
      }),
      error: (error) => {
        Swal.fire('Löschen', error.error, 'error').then();
      }
    });
  }
}
