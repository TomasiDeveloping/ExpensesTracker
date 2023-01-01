import {Component, OnInit} from '@angular/core';
import {CategoriesService} from "../services/categories.service";
import {CategoryModel} from "../models/category.model";
import Swal from 'sweetalert2';
import {ToastrService} from "ngx-toastr";
import {MatLegacyDialog as MatDialog} from "@angular/material/legacy-dialog";
import {CategoryEditDialogComponent} from "./category-edit-dialog/category-edit-dialog.component";
import {AuthService} from "../services/auth.service";
import {RevenueCategoryModel} from "../models/revenueCategory.model";
import {RevenueCategoryService} from "../services/revenue-category.service";
import {
  RevenueCategoryEditDialogComponent
} from "./revenue-category-edit-dialog/revenue-category-edit-dialog.component";
import {UsersService} from "../services/users.service";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  userCategories: CategoryModel[] = [];
  userRevenueCategories: RevenueCategoryModel[] = [];
  currentUserId = 0;
  isUserWithRevenue: boolean = false;

  constructor(private categoryService: CategoriesService,
              private authService: AuthService,
              private userService: UsersService,
              private revenueCategoryService: RevenueCategoryService,
              private toastr: ToastrService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserIdFromToken();
    if (this.currentUserId <= 0) {
      this.authService.logout();
    }
    this.isUserWithRevenue = this.userService.getWithRevenue();
    this.getUserCategories();
    if (this.isUserWithRevenue) {
      this.getUserRevenueCategories();
    }
  }

  getUserCategories() {
    this.categoryService.getUserCategories(this.currentUserId).subscribe((response) => {
      this.userCategories = response;
    });
  }

  getUserRevenueCategories() {
    this.revenueCategoryService.getUserRevenueCategories(this.currentUserId).subscribe({
      next: ((response) => {
        this.userRevenueCategories = response;
    })
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

  openRevenueDialog(revenueCategory: RevenueCategoryModel, isUpdate: boolean) {
    const dialogRef = this.dialog.open(RevenueCategoryEditDialogComponent, {
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

  onDelete(category: CategoryModel) {
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

  onEditRevenue(category: RevenueCategoryModel) {
    this.openRevenueDialog(category, true);
  }

  onDeleteDeleteRevenue(category: RevenueCategoryModel) {
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

  onAddRevenueCategory() {
    const revenueCategory: RevenueCategoryModel = new class implements RevenueCategoryModel {
      id = 0;
      name = '';
      userId = 0;
    };
    revenueCategory.userId = this.currentUserId;
    this.openRevenueDialog(revenueCategory, false);
  }

  private deleteRevenueCategory(category: RevenueCategoryModel) {
    this.revenueCategoryService.deleteRevenueCategory(category.id).subscribe({
      next: ((response) => {
        if (response) {
          this.getUserRevenueCategories();
          this.toastr.success(category.name + ' wurde gelöscht', 'Löschen');
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
