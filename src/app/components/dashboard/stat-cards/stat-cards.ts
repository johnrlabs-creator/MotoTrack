import { Component, input } from '@angular/core';
import { DashboardStats } from '@src/app/core/interfaces/dashboard.interface';

@Component({
  selector: 'app-stat-cards',
  imports: [],
  templateUrl: './stat-cards.html',
  styleUrl: './stat-cards.scss',
})
export class StatCards {
  stats = input<DashboardStats>();
}
