import { ServiceType } from '../constants/service.constants';

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  customServiceName?: string;
  // Interval-based
  mileageInterval?: number; // e.g. every 5000 miles
  monthInterval?: number; // e.g. every 6 months
  // Thresholds to trigger alert
  lastServiceMileage?: number;
  lastServiceDate?: Date;
  nextDueMileage?: number;
  nextDueDate?: Date;
  isActive: boolean;
}

export interface ServiceReminderSideBar {
  status?: 'ok' | 'due_soon' | 'overdue';
  milesUntilDue?: number;
  daysUntilDue?: number;
  service?: string;
  vehicle?: string;
  urgency?: string;
  dueLabel?: string;
  id: string;
}
