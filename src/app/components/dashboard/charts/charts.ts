import { Component, input } from '@angular/core';

@Component({
  selector: 'app-charts',
  imports: [],
  templateUrl: './charts.html',
  styleUrl: './charts.scss',
})
export class Charts {
  fleetHealthScore = input<number>();
  isChartsShown: boolean = false;

  showCartsClick() {
    if (!this.isChartsShown) {
      this.isChartsShown = !this.isChartsShown;
    }
    console.log('Show charts clicked!');
  }
}
