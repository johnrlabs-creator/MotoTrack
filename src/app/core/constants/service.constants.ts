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

  export interface ServiceReminder {
    id: string;
    vehicleId: string;
    serviceType: ServiceType;
    customServiceName?: string;
    // Interval-based
    mileageInterval?: number;       // e.g. every 5000 miles
    monthInterval?: number;         // e.g. every 6 months
    // Thresholds to trigger alert
    lastServiceMileage?: number;
    lastServiceDate?: Date;
    nextDueMileage?: number;
    nextDueDate?: Date;
    isActive: boolean;
  }