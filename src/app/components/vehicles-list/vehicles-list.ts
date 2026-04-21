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
import { FleetStat, Vehicle } from '../../core/interfaces/vehicle.interface';
import {
  filters,
  FilterValue,
  SortKey,
  VEHICLE_FLEET,
  ViewMode,
} from '../../core/constants/vehicle.constants';
import { LucideCar, LucideDynamicIcon, LucideTrash } from '@lucide/angular';

// Component

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [LucideDynamicIcon, LucideTrash, LucideCar],
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

    if (this.allVehicles().length === 0) {
      return [
        { label: 'Total Vehicles', value: '0', sub: 'in fleet', color: 'amber' },
        { label: 'Overdue', value: '0', sub: 'all clear', color: 'green' },
        { label: 'Fleet Health', value: '0%', sub: 'average score', color: 'red' },
        { label: 'Next Service', value: 'N/A', sub: 'no vehicles', color: 'green' },
      ];
    }

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
      .reduce((prev, curr) => {
        return Math.abs(curr.daysFromToday) < Math.abs(prev.daysFromToday) ? curr : prev;
      });

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
