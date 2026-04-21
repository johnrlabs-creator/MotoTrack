import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleApiService } from '../../../core/services/vehicle-api-service';
import { map, Subject, takeUntil } from 'rxjs';
import { Vehicle } from '../../../core/interfaces/vehicle.interface';

// Icons
import {
  LucideCar,
  LucideDynamicIcon,
  LucideBell,
  LucideFileText,
  LucideCircleGauge,
  LucideChartLine,
  LucideDownload,
  LucideCarFront,
} from '@lucide/angular';

@Component({
  selector: 'app-right-sidebar',
  imports: [LucideCar, LucideDynamicIcon, LucideChartLine, LucideDownload],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.scss',
})
export class RightSidebar implements OnInit {
  // START TODO: Static values to be replaced with dynamic data from login API
  userName = 'Ron';
  userInitial = 'R';
  userNickname = 'F1 Racer';
  // END TODO

  vehiclesForReminder: Vehicle[] = [];
  activeNav = signal<string>('dashboard');

  private router = inject(Router);
  private vehicleApiService = inject(VehicleApiService);
  private destroyed$ = new Subject<void>();

  sideNavItems = [
    { id: 'dashboard', iconType: LucideCircleGauge, label: 'Dashboard' },
    { id: 'vehicles', iconType: LucideCarFront, label: 'Vehicles' },
    { id: 'reminders', iconType: LucideBell, label: 'Reminders', disabled: true }, // TODO: disabled while feature not complete
    { id: 'log', iconType: LucideFileText, label: 'Maintenance Log', disabled: true }, // TODO: disabled while feature not complete
  ];

  protected readonly sideNavIcon = computed(() => {
    const activeNav = this.activeNav();
    return this.sideNavItems.find((item) => item.id === activeNav)?.iconType || 'LucideWrench';
  });

  ngOnInit(): void {
    this.setNav('dashboard');
    this.getAllVehicles();
  }

  setNav(nav: string): void {
    console.log('sidebar nav: ', nav);

    // TODO: Disable these until the features are implemented
    if (nav === 'log' || nav === 'reminders') return;

    this.activeNav.set(nav);
    this.router.navigate([`/${nav}`]);
  }

  get overdueCount(): number {
    return this.vehiclesForReminder.length;
  }

  getAllVehicles(): void {
    this.vehicleApiService
      .getVehiclesHttpRequest()
      .pipe(
        takeUntil(this.destroyed$),
        map((vehicles: Vehicle[]) =>
          vehicles.filter((v) => v.status === 'bad' || v.status === 'warn'),
        ),
      )
      .subscribe({
        next: (vehicles: Vehicle[]) => {
          if (vehicles.length > 0) {
            this.vehiclesForReminder = vehicles;
            console.log('vehiclesForReminder: ', this.vehiclesForReminder);
          }
        },
        error: (error) => {
          console.error('Error fetching vehicles:', error);
        },
      });
  }
}
