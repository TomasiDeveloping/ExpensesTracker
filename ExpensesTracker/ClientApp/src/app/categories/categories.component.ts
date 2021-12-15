import { Component, OnInit } from '@angular/core';
import {CategoriesService} from "../services/categories.service";
import {CategoryModel} from "../models/category.model";

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  userCategories: CategoryModel[] = [];

  constructor(private categoryService: CategoriesService) { }

  ngOnInit(): void {
    this.getUserCategories();
  }

  getUserCategories() {
    this.categoryService.getUserCategories(4).subscribe((response) => {
      this.userCategories = response;
    });
  }

}
