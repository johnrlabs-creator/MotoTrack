export interface Vehicle {
  id: number;
  icon: string;
  nickName: string;
  year: number;
  model: string;
  plateNumber: string;
  status: 'ok' | 'warn' | 'bad' | 'error';
  statusLabel: 'Good' | 'Due Soon' | 'Overdue';
  mile: string;
  vehicleType: 'van' | 'truck' | 'car' | 'motorcycle' | 'suv';
  make: string;
  color: string;
  fuelType: 'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid' | 'LPG';
  health: number; // 0–100,
  nextServiceDate: string; // ISO date string
}

export interface VehicleFormIdentity {
  nickName: string;
  vehicleType: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
}

export interface VehicleFormMileage {
  mile: number;
  fuelType: string;
  lastOilChangeMileage: number;
  oilChangeInterval: number;
  lastServiceDate: string;
  nextServiceDate: string;
}

export interface VehicleFormData {
  identity: VehicleFormIdentity;
  mileAge: VehicleFormMileage;
  review: Record<string, unknown>; // or define specific fields if you add any
}

export interface VehicleType {
  value: string;
  label: string;
  icon: string;
}

export interface FuelType {
  value: string;
  label: string;
}

export interface VehicleDetail {
  id: number;
  icon: string;
  nickname: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  tags: HeroTag[];
  ownerName: string;
  ownerInitial: string;
  overallHealth: number;
  heroStats: HeroStat[];
  healthBars: HealthBar[];
  specs: VehicleSpec[];
  reminders: Reminder[];
  /** Monthly cost data (Jan–Dec) */
  monthlyCosts: number[];
  timeline: TimelineEntry[];
}

export interface Reminder {
  service: string;
  interval: string;
  /** 'overdue' | 'soon' | 'ok' */
  urgency: 'overdue' | 'soon' | 'ok';
  /** HTML string — authored here, not from user input */
  dueLabel: string;
}

export interface HeroStat {
  label: string;
  value: string;
  sub: string;
  /** CSS class applied to value: 'amber' | 'green' | 'red' | '' */
  color: string;
}

export interface HeroTag {
  icon: string;
  label: string;
}

export interface HealthBar {
  label: string;
  value: number;
  /** 'green' | 'amber' | 'red' */
  color: string;
}

export interface VehicleSpec {
  label: string;
  value: string;
}

export interface TimelineEntry {
  date: string;
  mileage: string;
  service: string;
  shop: string;
  cost: string;
}
