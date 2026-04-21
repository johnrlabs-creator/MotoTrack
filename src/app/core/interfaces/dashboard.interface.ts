export interface DashboardStats {
  totalVehicles: number;
  overdueServices: number;
  spentThisYear: string;
  nextServiceDays: string;
  nextServiceDate: string;
}

export interface DashboardServiceReminder {
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
  icon: string; // Optional array of icon names to display with this log entry
}
