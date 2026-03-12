export interface Vehicle {
  id: number;
  icon?: string; // e.g. "🚐"
  name: string;
  year: number;
  model: string;
  plate: string;
  status?: 'ok' | 'warn' | 'error' | string;
  statusLabel?: string;
  mileage: string; // formatted (e.g. "78,100 mi")
}

export interface VehicleFormData {
  nickname: string;
  type: string;
  make: string;
  model: string;
  year: number | null;
  plate: string;
  color: string;
  mileage: number;
  fuelType: string;
  lastOilChangeMileage: number;
  oilChangeInterval: number;
  lastServiceDate: string;
  nextServiceDate: string;
}