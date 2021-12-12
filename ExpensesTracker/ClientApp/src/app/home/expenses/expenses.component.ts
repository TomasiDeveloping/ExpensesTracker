import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {

  // @ts-ignore
  @Input() categoryName: string;
  // @ts-ignore
  @Input() totalAmount: number;
  // @ts-ignore
  @Input() categoryAmount: number;
  consumptionPercent = 0;

  constructor() { }

  ngOnInit(): void {
    this.calculateConsumption();
  }

  private calculateConsumption() {
    this.consumptionPercent = (100 / this.totalAmount) * this.categoryAmount;
    this.consumptionPercent = Math.round(this.consumptionPercent * 100) / 100;
  }
}
