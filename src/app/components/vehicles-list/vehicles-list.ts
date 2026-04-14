import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  OnInit,
  inject,
} from '@angular/core';
import { VehicleApiService } from '../../core/services/vehicle-api-service';
import { Subject, takeUntil } from 'rxjs';
import { Vehicle } from '../../core/interfaces/vehicle.interface';
import { filters, FilterValue, VEHICLE_FLEET } from '../../core/constants/vehicle.constants';

// Interfaces

export interface VehicleNativeI {
  id: number;
  icon: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  /** 'ok' | 'warn' | 'overdue' — drives CSS classes */
  status: 'ok' | 'warn' | 'overdue';
  statusLabel: string;
  health: number;
  mileage: string;
  /** Raw mileage number for sorting */
  mileageRaw: number;
  totalServices: number;
  nextService: string;
  nextServiceDate: string;
  /** Days until next service — negative means overdue */
  nextServiceDays: number;
  /** Year as number for sorting */
  yearRaw: number;
}

export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

export interface FleetStat {
  label: string;
  value: string;
  sub: string;
  color: string;
}

export type SortKey = 'nickname' | 'status' | 'mileage' | 'nextService' | 'year';
export type ViewMode = 'grid' | 'list';

// Component

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [],
  templateUrl: './vehicles-list.html',
  styleUrls: ['./vehicles-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesListComponent implements OnInit {
  private vehicleApiService = inject(VehicleApiService);
  private destroyed$ = new Subject<void>();

  allVehicles = signal<Vehicle[]>([]);

  // View / filter / sort state
  viewMode = signal<ViewMode>('grid');
  activeFilter = signal<FilterValue>('all');
  sortBy = signal<SortKey>('nickname');
  searchQuery = signal('');

  readonly filters = filters;

  // TODO: implement totalServices to Vehicle, where it counts the number of maintenance logs
  // it should +1 every completed maintenance
  setFilter(value: FilterValue): void {
    console.log('setFilter: ', value);

    this.activeFilter.set(value);
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSort(event: Event): void {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortKey);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.activeFilter.set('all');
  }

  // VehicleNativeI data
  readonly vehicles: VehicleNativeI[] = [
    {
      id: 1,
      icon: '🚙',
      nickname: 'Daily Driver',
      make: 'Toyota',
      model: 'Vios',
      year: 2019,
      yearRaw: 2019,
      plate: 'ABC-1234',
      status: 'ok',
      statusLabel: 'Good',
      health: 84,
      mileage: '42,300',
      mileageRaw: 42300,
      totalServices: 8,
      nextService: 'Air Filter',
      nextServiceDate: 'Mar 21',
      nextServiceDays: 12,
    },
    {
      id: 2,
      icon: '🚐',
      nickname: 'Family Van',
      make: 'Toyota',
      model: 'Hi-Ace',
      year: 2017,
      yearRaw: 2017,
      plate: 'XYZ-5678',
      status: 'warn',
      statusLabel: 'Due Soon',
      health: 61,
      mileage: '78,100',
      mileageRaw: 78100,
      totalServices: 14,
      nextService: 'Tire Rotation',
      nextServiceDate: 'Mar 18',
      nextServiceDays: 4,
    },
    {
      id: 3,
      icon: '🏍',
      nickname: 'Weekend Bike',
      make: 'Honda',
      model: 'Click 125',
      year: 2021,
      yearRaw: 2021,
      plate: 'MNO-9012',
      status: 'overdue',
      statusLabel: 'Overdue',
      health: 38,
      mileage: '11,850',
      mileageRaw: 11850,
      totalServices: 3,
      nextService: 'Oil Change',
      nextServiceDate: 'OVERDUE',
      nextServiceDays: -12,
    },
    {
      id: 4,
      icon: '🛻',
      nickname: 'Work Truck',
      make: 'Mitsubishi',
      model: 'L200 Strada',
      year: 2020,
      yearRaw: 2020,
      plate: 'DEF-3456',
      status: 'ok',
      statusLabel: 'Good',
      health: 91,
      mileage: '55,200',
      mileageRaw: 55200,
      totalServices: 11,
      nextService: 'Oil Change',
      nextServiceDate: 'Apr 05',
      nextServiceDays: 22,
    },
    {
      id: 5,
      icon: '🚗',
      nickname: "Wife's Car",
      make: 'Honda',
      model: 'Jazz',
      year: 2022,
      yearRaw: 2022,
      plate: 'GHI-7890',
      status: 'ok',
      statusLabel: 'Good',
      health: 95,
      mileage: '18,400',
      mileageRaw: 18400,
      totalServices: 4,
      nextService: 'Tire Rotation',
      nextServiceDate: 'Apr 12',
      nextServiceDays: 29,
    },
    {
      id: 6,
      icon: '🚙',
      nickname: 'Old Reliable',
      make: 'Toyota',
      model: 'Corolla',
      year: 2012,
      yearRaw: 2012,
      plate: 'JKL-1122',
      status: 'warn',
      statusLabel: 'Due Soon',
      health: 52,
      mileage: '134,700',
      mileageRaw: 134700,
      totalServices: 28,
      nextService: 'Brake Inspection',
      nextServiceDate: 'Mar 17',
      nextServiceDays: 3,
    },
  ];

  // Fleet summary stats (computed)
  readonly fleetStats = computed<FleetStat[]>(() => {
    const total = this.vehicles.length;
    const overdue = this.vehicles.filter((v) => v.status === 'overdue').length;
    const avgHealth = Math.round(this.vehicles.reduce((s, v) => s + v.health, 0) / total);
    const nextDue = [...this.vehicles].sort((a, b) => a.nextServiceDays - b.nextServiceDays)[0];

    return [
      {
        label: 'Total Vehicles',
        value: String(total),
        sub: 'in fleet',
        color: 'amber',
      },
      {
        label: 'Overdue',
        value: String(overdue),
        sub: overdue > 0 ? 'needs attention' : 'all clear',
        color: overdue > 0 ? 'red' : 'green',
      },
      {
        label: 'Fleet Health',
        value: avgHealth + '%',
        sub: 'average score',
        color: avgHealth >= 75 ? 'green' : avgHealth >= 50 ? 'amber' : 'red',
      },
      {
        label: 'Next Service',
        value: nextDue.nextServiceDays <= 0 ? 'OVERDUE' : nextDue.nextServiceDays + 'd',
        sub: nextDue.nickname + ' · ' + nextDue.nextService,
        color: nextDue.nextServiceDays <= 0 ? 'red' : nextDue.nextServiceDays <= 7 ? 'amber' : '',
      },
    ];
  });

  // Filtered + sorted vehicles (computed)
  readonly filteredVehicles = computed<Vehicle[]>(() => {
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    const sort = this.sortBy();

    let list2 = this.allVehicles().filter((v) => {
      const matchesFilter = filter === 'all' || v.status === filter;
      console.log('matchesFilter:', matchesFilter);

      const matchesSearch =
        !query ||
        [v.nickName, v.make, v.model, v.plateNumber, v.year.toString()].some((s) =>
          s.toLowerCase().includes(query),
        );
      return matchesFilter && matchesSearch;
    });

    // let list = this.vehicles.filter((v) => {
    //   const matchesFilter = filter === 'all' || v.status === filter;
    //   const matchesSearch =
    //     !query ||
    //     [v.nickname, v.make, v.model, v.plate, v.year.toString()].some((s) =>
    //       s.toLowerCase().includes(query),
    //     );
    //   return matchesFilter && matchesSearch;
    // });

    const sortMap: Record<SortKey, (a: Vehicle, b: Vehicle) => number> = {
      nickname: (a, b) => a.nickName.localeCompare(b.nickName),
      status: (a, b) => {
        const order = { bad: -1, error: 0, warn: 1, ok: 2 };
        return order[a.status] - order[b.status];
      },
      mileage: (a, b) => {
        const mileageA = Number(a.mile.replace(/[^0-9.]/g, ''));
        const mileageB = Number(b.mile.replace(/[^0-9.]/g, ''));
        return mileageB - mileageA;
      },
      nextService: (a, b) =>
        new Date(a.nextServiceDate).getTime() - new Date(b.nextServiceDate).getTime(),
      year: (a, b) => b.year - a.year,
    };

    return [...list2].sort(sortMap[sort]);
  });

  // Helper methods

  healthColor(health: number): string {
    if (health >= 75) return 'text-green-400';
    if (health >= 50) return 'text-amber-400';
    return 'text-red-400';
  }

  nextDueColor(days: number): string {
    if (days <= 0) return 'text-red-400';
    if (days <= 7) return 'text-amber-400';
    return 'text-green-400';
  }

  nextDueDot(days: number): string {
    if (days <= 0) return 'bg-red-500 shadow-[0_0_6px_theme(colors.red.500)]';
    if (days <= 7) return 'bg-amber-400 shadow-[0_0_6px_theme(colors.amber.400)]';
    return 'bg-green-500';
  }

  // Actions

  onAddVehicle(): void {
    // TODO: inject ModalService and open AddVehicleFormComponent
    console.log('Add vehicle');
  }

  onViewVehicle(v: Vehicle): void {
    // TODO: this.router.navigate(['/vehicles', v.id])
    console.log('View vehicle:', v.id);
  }

  onEdit(v: Vehicle): void {
    // TODO: open EditVehicleModal
    console.log('Edit:', v.id);
  }

  onLogService(v: Vehicle): void {
    // TODO: open LogServiceModal
    console.log('Log service for:', v.id);
  }

  onDelete(vehicle: Vehicle): void {
    console.log('Delete:', vehicle.id);
    this.vehicleApiService.deleteVehicleHttpRequest(vehicle.id).subscribe({
      next: () => {
        console.log('Vehicle deleted successfully');
        this.getVehicles();
      },
      error: (error) => {
        console.error('Error deleting vehicle:', error);
      },
    });
  }

  // Lifecycle hooks

  ngOnInit(): void {
    this.getVehicles();
  }

  getVehicles(): void {
    this.vehicleApiService
      .getVehiclesHttpRequest()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (vehicles: Vehicle[]) => {
          if (vehicles.length > 0) {
            this.setFleet(vehicles);
            this.allVehicles.set(vehicles);
          }
        },
        error: (error) => {
          console.error('Error fetching vehicles:', error);
        },
      });
  }

  setFleet(vehicles: Vehicle[]): void {}

  readonly computedFleetStats = computed<FleetStat[]>(() => {
    console.log('run computed fleetStats');

    // if (this.allVehicles().length === 0) {
    //   return [];
    // }
    // const fleet = VEHICLE_FLEET.map((el) => {
    //   switch (el.key) {
    //     case 'totalVehicles':
    //       return { ...el, value: this.allVehicles().length };
    //     case 'overdueServices':
    //       return {
    //         ...el,
    //         value: this.allVehicles().filter((v) => v.statusLabel === 'Overdue').length,
    //       };
    //     case 'fleetHealth':
    //       const totalHealth = this.allVehicles().reduce((sum, v) => sum + v.health, 0);
    //       return { ...el, value: totalHealth / this.allVehicles().length };
    //     case 'nextService':
    //       const today = new Date();
    //       const MS_PER_DAY = 1000 * 60 * 60 * 24;

    //       const nearest = this.allVehicles()
    //         .map((bike) => ({
    //           ...bike,
    //           daysFromToday: Math.round(
    //             (new Date(bike.nextServiceDate).getTime() - today.getTime()) / MS_PER_DAY,
    //           ),
    //         }))
    //         .reduce((prev, curr) =>
    //           Math.abs(curr.daysFromToday) < Math.abs(prev.daysFromToday) ? curr : prev,
    //         );

    //       console.log(nearest.nickName); // e.g. "Kawasaki Z400"
    //       console.log(nearest.daysFromToday); // e.g. -815 (days since purchase)
    //       return {
    //         ...el,
    //         value: nearest.statusLabel,
    //         sub: nearest.nickName,
    //         //  + ' · ' + nearest.nextService TODO: add nextService to Vehicle and display here
    //         color:
    //           nearest.statusLabel === 'Overdue'
    //             ? 'red'
    //             : nearest.statusLabel === 'Due Soon'
    //               ? 'amber'
    //               : 'green',
    //       };
    //   }

    const totalHealth = this.allVehicles().reduce((sum, v) => sum + v.health, 0);
    const avgHealth = totalHealth / this.allVehicles().length;

    const today = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    const nearest = this.allVehicles()
      .map((bike) => ({
        ...bike,
        daysFromToday: Math.round(
          (new Date(bike.nextServiceDate).getTime() - today.getTime()) / MS_PER_DAY,
        ),
      }))
      ?.reduce((prev, curr) =>
        Math.abs(curr.daysFromToday) < Math.abs(prev.daysFromToday) ? curr : prev,
      );

    console.log(nearest.nickName); // e.g. "Kawasaki Z400"
    console.log(nearest.daysFromToday); // e.g. -815 (days since purchase)

    return [
      {
        label: 'Total Vehicles',
        value: this.allVehicles().length?.toString(),
        sub: 'in fleet',
        color: 'amber',
      },
      {
        label: 'Overdue',
        value: this.allVehicles()
          .filter((v) => v.statusLabel === 'Overdue')
          .length?.toString(),
        sub:
          this.allVehicles().filter((v) => v.statusLabel === 'Overdue').length > 0
            ? 'needs attention'
            : 'all clear',
        color:
          this.allVehicles().filter((v) => v.statusLabel === 'Overdue').length > 0
            ? 'red'
            : 'green',
      },
      {
        label: 'Fleet Health',
        value: Math.round(((totalHealth / this.allVehicles().length) * 10) / 10)?.toString() + '%',
        sub: 'average score',
        color: avgHealth >= 75 ? 'green' : avgHealth >= 50 ? 'amber' : 'red',
      },
      {
        label: 'Next Service',
        value: nearest.statusLabel,
        sub: nearest.nickName,
        color:
          nearest.statusLabel === 'Overdue'
            ? 'red'
            : nearest.statusLabel === 'Due Soon'
              ? 'amber'
              : 'green',
      },
    ];
  });

  getDaysFromNow(dateStr: string): number {
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}
