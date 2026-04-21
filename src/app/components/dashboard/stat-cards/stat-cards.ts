import { Component, input } from '@angular/core';
import {
  LucideCarFront,
  LucideTriangleAlert,
  LucideChartBarStacked,
  LucideCalendarDays,
} from '@lucide/angular';
import { DashboardStats } from '@src/app/core/interfaces/dashboard.interface';

@Component({
  selector: 'app-stat-cards',
  imports: [LucideCarFront, LucideTriangleAlert, LucideChartBarStacked, LucideCalendarDays],
  templateUrl: './stat-cards.html',
  styleUrl: './stat-cards.scss',
})
export class StatCards {
  stats = input<DashboardStats>();
}
