import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleApiService } from '../../../core/services/vehicle-api-service';
import { map, Subject, takeUntil } from 'rxjs';
import { Vehicle } from '../../../core/interfaces/vehicle.interface';

@Component({
  selector: 'app-right-sidebar',
  imports: [],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.scss',
})
export class RightSidebar implements OnInit {
  // START TODO: Static values to be replaced with dynamic data from login API
  userName = 'R';
  userInitial = 'R';
  userPlan = 'Free Plan';
  // END TODO

  vehiclesForReminder: Vehicle[] = [];
  activeNav = signal<string>('dashboard');

  private router = inject(Router);
  private vehicleApiService = inject(VehicleApiService);
  private destroyed$ = new Subject<void>();

  sideNavItems = [
    { id: 'dashboard', iconType: '◈', label: 'Dashboard' },
    { id: 'vehicles', iconType: '🚗', label: 'Vehicles' },
    { id: 'log', iconType: '📋', label: 'Maintenance Log' },
    { id: 'reminders', iconType: '🔔', label: 'Reminders' },
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
