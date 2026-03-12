import { Injectable, signal, computed } from '@angular/core';
// import { Vehicle } from '../models'; // TODO: ADD model

export interface Vehicle {
  id: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  vin?: string;
  color?: string;
  licensePlate?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'vmt_vehicles';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  // --- State (Signals) ---
  private _vehicles = signal<Vehicle[]>(this.loadFromStorage());
  readonly vehicles = this._vehicles.asReadonly();
  readonly vehicleCount = computed(() => this._vehicles().length);

  // --- CRUD ---
  addVehicle(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Vehicle {
    const vehicle: Vehicle = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this._vehicles.update(v => [...v, vehicle]);
    this.saveToStorage();
    return vehicle;
  }

  updateVehicle(id: string, data: Partial<Vehicle>): void {
    this._vehicles.update(vehicles =>
      vehicles.map(v =>
        v.id === id ? { ...v, ...data, updatedAt: new Date() } : v
      )
    );
    this.saveToStorage();
  }

  deleteVehicle(id: string): void {
    this._vehicles.update(vehicles => vehicles.filter(v => v.id !== id));
    this.saveToStorage();
  }

  getById(id: string): Vehicle | undefined {
    return this._vehicles().find(v => v.id === id);
  }

  // Update mileage when a new maintenance entry is added
  updateMileage(vehicleId: string, newMileage: number): void {
    const vehicle = this.getById(vehicleId);
    if (vehicle && newMileage > vehicle.mileage) {
      this.updateVehicle(vehicleId, { mileage: newMileage });
    }
  }

  // --- Persistence ---
  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._vehicles()));
  }

  private loadFromStorage(): Vehicle[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((v: Vehicle) => ({
      ...v,
      createdAt: new Date(v.createdAt),
      updatedAt: new Date(v.updatedAt),
    }));
  }
}