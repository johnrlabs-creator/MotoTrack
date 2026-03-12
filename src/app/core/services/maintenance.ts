import { Injectable, signal, computed } from '@angular/core';
import { VehicleService } from './vehicle';
import { MaintenanceEntry } from '../models/maintenance.interface';

const STORAGE_KEY = 'vmt_maintenance';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private _entries = signal<MaintenanceEntry[]>(this.loadFromStorage());
  readonly entries = this._entries.asReadonly();

  constructor(private vehicleService: VehicleService) {}

  // Entries for a specific vehicle
  entriesForVehicle(vehicleId: string) {
    return computed(() =>
      this._entries()
        .filter((e) => e.vehicleId === vehicleId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    );
  }

  // Total cost per vehicle this year
  totalCostThisYear(vehicleId: string): number {
    const year = new Date().getFullYear();
    return this._entries()
      .filter((e) => e.vehicleId === vehicleId && new Date(e.date).getFullYear() === year)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  // Cost grouped by month (for charts)
  monthlyCosts(vehicleId: string): { name: string; value: number }[] {
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      value: 0,
    }));
    this._entries()
      .filter(
        (e) =>
          e.vehicleId === vehicleId && new Date(e.date).getFullYear() === new Date().getFullYear(),
      )
      .forEach((e) => {
        months[new Date(e.date).getMonth()].value += e.cost;
      });
    return months;
  }

  addEntry(data: Omit<MaintenanceEntry, 'id' | 'createdAt'>): MaintenanceEntry {
    const entry: MaintenanceEntry = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this._entries.update((e) => [...e, entry]);
    this.vehicleService.updateMileage(data.vehicleId, data.mileage);
    this.saveToStorage();
    return entry;
  }

  updateEntry(id: string, data: Partial<MaintenanceEntry>): void {
    this._entries.update((entries) => entries.map((e) => (e.id === id ? { ...e, ...data } : e)));
    this.saveToStorage();
  }

  deleteEntry(id: string): void {
    this._entries.update((entries) => entries.filter((e) => e.id !== id));
    this.saveToStorage();
  }

  // Export to CSV
  exportCSV(vehicleId: string): string {
    const headers = ['Date', 'Service', 'Mileage', 'Cost', 'Shop', 'Notes'];
    const rows = this.entriesForVehicle(vehicleId)().map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.customServiceName || e.serviceType,
      e.mileage,
      e.cost.toFixed(2),
      e.shop || '',
      e.notes || '',
    ]);
    return [headers, ...rows].map((r) => r.join(',')).join('\n');
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._entries()));
  }

  private loadFromStorage(): MaintenanceEntry[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((e: MaintenanceEntry) => ({
      ...e,
      date: new Date(e.date),
      createdAt: new Date(e.createdAt),
    }));
  }
}
