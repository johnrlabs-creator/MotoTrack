import { FuelType, VehicleType } from '../interfaces/vehicle.interface';

export const VEHICLE_TYPES: VehicleType[] = [
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'suv', label: 'SUV', icon: '🚙' },
  { value: 'van', label: 'Van', icon: '🚐' },
  { value: 'truck', label: 'Truck', icon: '🛻' },
  { value: 'motorcycle', label: 'Moto', icon: '🏍' },
];

export const FUEL_TYPES: FuelType[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
];

export const VEHICLE_FLEET = [
  {
    key: 'totalVehicles',
    label: 'Total Vehicles',
    value: null,
    sub: 'in fleet',
    color: 'amber',
  },
  {
    key: 'overdueServices',
    label: 'Overdue',
    value: null,
    sub: 'all clear', // overdue > 0 ? 'needs attention' : 'all clear',
    color: 'green', // overdue > 0 ? 'red' : 'green',
  },
  {
    key: 'fleetHealth',
    label: 'Fleet Health',
    value: '' + '%', // avgHealth + '%'
    sub: 'average score',
    color: 'green', // avgHealth >= 75 ? 'green' : avgHealth >= 50 ? 'amber' : 'red',
  },
  {
    key: 'nextService',
    label: 'Next Service',
    value: null, // nextDue.nextServiceDays <= 0 ? 'OVERDUE' : nextDue.nextServiceDays + 'd',
    sub: 'next due vehicle', // nextDue.nickname + ' · ' + nextDue.nextService,
    color: 'green', // nextDue.nextServiceDays <= 0 ? 'red' : nextDue.nextServiceDays <= 7 ? 'amber' : '',
  },
];

export const filters = [
  { value: 'all' as FilterValue, label: 'All', activeClass: 'f-all' },
  { value: 'ok' as FilterValue, label: 'Good', activeClass: 'f-ok' },
  { value: 'warn' as FilterValue, label: 'Due Soon', activeClass: 'f-soon' },
  { value: 'bad' as FilterValue, label: 'Overdue', activeClass: 'f-overdue' },
];

export type FilterValue = 'all' | 'ok' | 'warn' | 'bad';
