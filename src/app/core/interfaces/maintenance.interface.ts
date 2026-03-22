export interface MaintenanceEntry {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  customServiceName?: string;
  date: Date;
  mileage: number;
  cost: number;
  shop?: string;
  notes?: string;
  receiptImageUrl?: string;
  createdAt: Date;
}

export type ServiceType =
  | 'oil_change'
  | 'tire_rotation'
  | 'tire_replacement'
  | 'brake_inspection'
  | 'brake_replacement'
  | 'air_filter'
  | 'cabin_filter'
  | 'battery'
  | 'coolant_flush'
  | 'transmission_fluid'
  | 'spark_plugs'
  | 'timing_belt'
  | 'wheel_alignment'
  | 'inspection'
  | 'registration'
  | 'other';
