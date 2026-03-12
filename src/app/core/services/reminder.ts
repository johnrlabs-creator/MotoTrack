import { Injectable, signal, computed } from '@angular/core';
import { ServiceReminder } from '../constants/service.constants';
import { VehicleService } from './vehicle';
import { ServiceType } from '../constants/service.constants';





const STORAGE_KEY = 'vmt_reminders';
const WARN_MILES_AHEAD = 500;   // warn if within 500 miles
const WARN_DAYS_AHEAD = 14;     // warn if within 14 days

export type ReminderStatus = 'ok' | 'due_soon' | 'overdue';

export interface ReminderWithStatus extends ServiceReminder {
  status: ReminderStatus;
  milesUntilDue?: number;
  daysUntilDue?: number;
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private _reminders = signal<ServiceReminder[]>(this.loadFromStorage());
  readonly reminders = this._reminders.asReadonly();

  constructor(private vehicleService: VehicleService) {}

  remindersForVehicle(vehicleId: string): ReminderWithStatus[] {
    const vehicle = this.vehicleService.getById(vehicleId);
    if (!vehicle) return [];

    return this._reminders()
      .filter(r => r.vehicleId === vehicleId && r.isActive)
      .map(r => this.enrichWithStatus(r, vehicle.mileage));
  }

  allActiveReminders(): ReminderWithStatus[] {
    return this._reminders()
      .filter(r => r.isActive)
      .map(r => {
        const vehicle = this.vehicleService.getById(r.vehicleId);
        return this.enrichWithStatus(r, vehicle?.mileage ?? 0);
      })
      .sort((a, b) => this.statusPriority(a.status) - this.statusPriority(b.status));
  }

  overdueCount(): number {
    return this.allActiveReminders().filter(r => r.status === 'overdue').length;
  }

  dueSoonCount(): number {
    return this.allActiveReminders().filter(r => r.status === 'due_soon').length;
  }

  private enrichWithStatus(reminder: ServiceReminder, currentMileage: number): ReminderWithStatus {
    let status: ReminderStatus = 'ok';
    let milesUntilDue: number | undefined;
    let daysUntilDue: number | undefined;

    if (reminder.nextDueMileage !== undefined) {
      milesUntilDue = reminder.nextDueMileage - currentMileage;
      if (milesUntilDue <= 0) status = 'overdue';
      else if (milesUntilDue <= WARN_MILES_AHEAD) status = 'due_soon';
    }

    if (reminder.nextDueDate) {
      const today = new Date();
      const due = new Date(reminder.nextDueDate);
      daysUntilDue = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0 && status !== 'overdue') status = 'overdue';
      else if (daysUntilDue <= WARN_DAYS_AHEAD && status === 'ok') status = 'due_soon';
    }

    return { ...reminder, status, milesUntilDue, daysUntilDue };
  }

  // Call this after a maintenance entry is logged to reset intervals
  markServiced(vehicleId: string, serviceType: string, currentMileage: number): void {
    const today = new Date();
    this._reminders.update(reminders =>
      reminders.map(r => {
        if (r.vehicleId !== vehicleId || r.serviceType !== serviceType) return r;
        const nextMileage = r.mileageInterval
          ? currentMileage + r.mileageInterval
          : undefined;
        const nextDate = r.monthInterval
          ? new Date(today.setMonth(today.getMonth() + r.monthInterval))
          : undefined;
        return {
          ...r,
          lastServiceMileage: currentMileage,
          lastServiceDate: new Date(),
          nextDueMileage: nextMileage,
          nextDueDate: nextDate,
        };
      })
    );
    this.saveToStorage();
  }

  addReminder(data: Omit<ServiceReminder, 'id'>): ServiceReminder {
    const reminder: ServiceReminder = { ...data, id: crypto.randomUUID() };
    this._reminders.update(r => [...r, reminder]);
    this.saveToStorage();
    return reminder;
  }

  updateReminder(id: string, data: Partial<ServiceReminder>): void {
    this._reminders.update(reminders =>
      reminders.map(r => (r.id === id ? { ...r, ...data } : r))
    );
    this.saveToStorage();
  }

  deleteReminder(id: string): void {
    this._reminders.update(reminders => reminders.filter(r => r.id !== id));
    this.saveToStorage();
  }

  private statusPriority(status: ReminderStatus): number {
    return { overdue: 0, due_soon: 1, ok: 2 }[status];
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._reminders()));
  }

  private loadFromStorage(): ServiceReminder[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((r: ServiceReminder) => ({
      ...r,
      lastServiceDate: r.lastServiceDate ? new Date(r.lastServiceDate) : undefined,
      nextDueDate: r.nextDueDate ? new Date(r.nextDueDate) : undefined,
    }));
  }
}