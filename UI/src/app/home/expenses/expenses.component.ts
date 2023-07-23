import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  @Input() categoryName!: string;
  @Input() totalAmount!: number;
  @Input() categoryAmount!: number;
  public consumptionPercent = 0;

  constructor() { }

  ngOnInit(): void {
    this.calculateConsumption();
  }

  private calculateConsumption() {
    this.consumptionPercent = (100 / this.totalAmount) * this.categoryAmount;
    this.consumptionPercent = Math.round(this.consumptionPercent * 100) / 100;
  }
}
