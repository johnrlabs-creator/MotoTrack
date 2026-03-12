import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleApiService } from '../../core/services/vehicle-api-service';
import { Vehicle, VehicleFormData } from '../../core/models/vehicle.interface';
import { takeUntil, Subject } from 'rxjs';
import { ModalComponent } from '../shared/modal/modal';

// ── Data interfaces ────────────────────────────────────────────────────────

export interface DashboardStats {
  totalVehicles: number;
  overdueServices: number;
  spentThisYear: string;
  nextServiceDays: string;
  nextServiceDate: string;
}

// export interface Vehicle {
//   id: number;
//   icon: string;
//   name: string;
//   year: number;
//   model: string;
//   plate: string;
//   /** 'ok' | 'warn' | 'bad' — drives CSS class on .vehicle-icon and .pill */
//   status: 'ok' | 'warn' | 'bad';
//   statusLabel: string;
//   mileage: string;
// }

export interface ServiceReminder {
  id: number;
  service: string;
  vehicle: string;
  /** 'overdue' | 'soon' | 'ok' — drives CSS class on .reminder-item */
  urgency: 'overdue' | 'soon' | 'ok';
  /** HTML string used with [innerHTML]; safe because it is authored here, not user input */
  dueLabel: string;
}

export interface MaintenanceLog {
  id: number;
  date: string;
  vehicle: string;
  service: string;
  mileage: string;
  shop: string;
  cost: string;
}

// ── Component ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // ── Sidebar / User ───────────────────────────────────────────────────────
  activeNav = 'dashboard';
  userName = 'R';
  userInitial = 'R';
  userPlan = 'Free Plan';

  // ── Stats ────────────────────────────────────────────────────────────────
  // stats: DashboardStats = {
  //   totalVehicles:   0,
  //   overdueServices: 2, // TODO
  //   spentThisYear:   '₱8,420',// TODO
  //   nextServiceDays: '12d',// TODO
  //   nextServiceDate: 'Mar 21, 2026',// TODO
  // };

  stats = signal<DashboardStats>({
    totalVehicles: 0,
    overdueServices: 2, // TODO
    spentThisYear: '₱8,420', // TODO
    nextServiceDays: '12d', // TODO
    nextServiceDate: 'Mar 21, 2026', // TODO
  });

  get overdueCount(): number {
    return this.reminders.filter((r) => r.urgency === 'overdue').length;
  }

  fleetHealthScore = 67;

  // ── Vehicles ─────────────────────────────────────────────────────────────
  vehicles: Vehicle[] = [];

  // ── Reminders ────────────────────────────────────────────────────────────
  reminders: ServiceReminder[] = [
    {
      id: 1,
      service: 'Oil Change',
      vehicle: 'Honda Click 125',
      urgency: 'overdue',
      dueLabel: 'OVERDUE<br>+340 mi ago',
    },
    {
      id: 2,
      service: 'Tire Rotation',
      vehicle: 'Toyota Hi-Ace',
      urgency: 'overdue',
      dueLabel: 'OVERDUE<br>+12 days ago',
    },
    {
      id: 3,
      service: 'Air Filter',
      vehicle: 'Toyota Vios',
      urgency: 'soon',
      dueLabel: 'DUE SOON<br>in 12 days',
    },
    {
      id: 4,
      service: 'Brake Inspection',
      vehicle: 'Toyota Hi-Ace',
      urgency: 'soon',
      dueLabel: 'DUE SOON<br>in 480 mi',
    },
    {
      id: 5,
      service: 'Coolant Flush',
      vehicle: 'Toyota Vios',
      urgency: 'ok',
      dueLabel: 'OK<br>in 45 days',
    },
  ];

  // ── Maintenance Log ───────────────────────────────────────────────────────
  maintenanceLogs: MaintenanceLog[] = [
    {
      id: 1,
      date: 'Mar 01, 2026',
      vehicle: 'Toyota Vios',
      service: '🔧 Oil Change',
      mileage: '42,100 mi',
      shop: 'Petron Autoserv',
      cost: '₱850',
    },
    {
      id: 2,
      date: 'Feb 18, 2026',
      vehicle: 'Toyota Hi-Ace',
      service: '🛞 Tire Replacement',
      mileage: '77,800 mi',
      shop: 'Llantera Mabilis',
      cost: '₱3,200',
    },
    {
      id: 3,
      date: 'Feb 05, 2026',
      vehicle: 'Honda Click 125',
      service: '🔋 Battery',
      mileage: '11,500 mi',
      shop: 'Honda Dealership',
      cost: '₱1,450',
    },
    {
      id: 4,
      date: 'Jan 22, 2026',
      vehicle: 'Toyota Vios',
      service: '🛑 Brake Inspection',
      mileage: '41,700 mi',
      shop: 'Toyota PH Service',
      cost: '₱620',
    },
  ];

  // ── Chart instances (kept for cleanup) ───────────────────────────────────
  private costChart: any;
  private donutChart: any;

  // ── Cleanup ──────────────────────────────────────────────────────────────
  private destroyed$ = new Subject<void>();

  // Services
  private vehicleApiService = inject(VehicleApiService);
  private cdr = inject(ChangeDetectorRef);

  showAddVehicleModal = false;

  onModalClosed(): void {
    this.showAddVehicleModal = false;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.getVehicles();
  }

  getVehicles(): void {
    this.vehicleApiService
      .getVehiclesRequest()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (vehicles: Vehicle[]) => {
          if (vehicles.length > 0) {
            this.vehicles = vehicles;
            this.updateVehicleStats(this.vehicles);
          }
        },
        error: (error) => {
          console.error('Error fetching vehicles:', error);
        },
      });
  }

  updateVehicleStats(vehicles: Vehicle[]): void {
    // this.stats = {
    //   ...this.stats,
    //   totalVehicles: vehicles.length,
    // };
    this.stats.update((stats) => ({
      ...stats,
      totalVehicles: vehicles.length,
    }));
    console.log('stats: ', this.stats);
  }

  ngAfterViewInit(): void {
    // this.initCostChart();
    // this.initDonutChart();
  }

  ngOnDestroy(): void {
    this.costChart?.destroy();
    this.donutChart?.destroy();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Chart initializers
  private initCostChart(): void {}

  private initDonutChart(): void {}

  // Event handlers

  setNav(nav: string): void {
    this.activeNav = nav;
  }

  onExport(): void {
    console.log('Export triggered');
    // TODO: implement CSV export via a service
  }

  onAddVehicle(): void {
    console.log('Add vehicle triggered');
    // TODO: open add-vehicle modal / navigate to route
    this.showAddVehicleModal = true;
  }

  onVehicleAdded(data: VehicleFormData): void {
    // TODO
  }

  onVehicleClick(vehicle: Vehicle): void {
    console.log('Vehicle clicked:', vehicle);
    // TODO: navigate to vehicle detail page
  }

  onViewAll(): void {
    console.log('View all maintenance logs');
    // TODO: navigate to full log view
  }
}
