import { Injectable } from '@angular/core';
import {
  Vehicle,
  VehicleFormData,
  VehicleFormMileage,
} from '../../core/interfaces/vehicle.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardHelper {
  mileage: VehicleFormMileage = null as unknown as VehicleFormMileage;

  constructVehiclePayload(data: VehicleFormData): Vehicle {
    this.mileage = data.mileAge;
    const payload: Vehicle = {
      id: Date.now(), // Temporary ID generation; replace with backend-generated ID
      icon: this.getTypeIcon(data.identity.vehicleType),
      nickName: data.identity.nickName,
      year: data.identity.year,
      model: data.identity.model,
      plateNumber: data.identity.plateNumber,
      status: this.computedStatus,
      statusLabel: this.computedStatusLabel,
      mile: `${data.mileAge.mile} mi`,
      vehicleType: data.identity.vehicleType as Vehicle['vehicleType'],
      make: data.identity.make,
      color: data.identity.color,
      fuelType: data.mileAge.fuelType as Vehicle['fuelType'],
      health: this.getHealth(data.mileAge),
      nextServiceDate: data.mileAge.nextServiceDate, // Add next service date to payload
    };
    return payload;
  }

  getHealth(mileage: VehicleFormMileage) {
    const milesElapsed = mileage.mile - mileage.lastOilChangeMileage;

    const oilHealth = Math.max(
      0,
      Math.round(((mileage.oilChangeInterval - milesElapsed) / mileage.oilChangeInterval) * 100),
    );

    // You can add more health factors here (e.g., time-based degradation) and average them
    return oilHealth; // For now, we just return oil health as overall health
  }

  private getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      car: 'car-front',
      truck: 'truck',
      van: 'van',
      motorcycle: 'motorbike',
      suv: 'car',
    };
    return map[type] || '';
  }

  getStatus(mileage: VehicleFormMileage) {
    const progress = this.getOilChangeProgress(mileage);
    console.log('progress: ', progress);
  }

  getOilChangeProgress(mileage: VehicleFormMileage): number | null {
    const { mile, lastOilChangeMileage, oilChangeInterval } = mileage;
    if (!mile || !lastOilChangeMileage || !oilChangeInterval) return null;
    const driven = mile - lastOilChangeMileage;
    return (driven / oilChangeInterval) * 100;
  }

  get oilChangeProgress(): number | null {
    const { mile, lastOilChangeMileage, oilChangeInterval } = this.mileage;
    if (!mile || !lastOilChangeMileage || !oilChangeInterval) return null;
    const driven = mile - lastOilChangeMileage;
    return (driven / oilChangeInterval) * 100;
  }

  /** Derives a status string based on mileage and service date proximity */
  get computedStatus(): 'ok' | 'warn' | 'bad' {
    const progress = this.oilChangeProgress;
    if (progress === null) return 'ok';
    if (progress > 100) return 'bad';
    if (progress > 75) return 'warn';
    return 'ok';
  }

  get computedStatusLabel(): 'Good' | 'Due Soon' | 'Overdue' {
    const map: Record<'ok' | 'warn' | 'bad', 'Good' | 'Due Soon' | 'Overdue'> = {
      ok: 'Good',
      warn: 'Due Soon',
      bad: 'Overdue',
    };
    return map[this.computedStatus];
  }
}
