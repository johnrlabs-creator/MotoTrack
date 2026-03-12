import { Routes } from '@angular/router';

export const routes: Routes = [
{
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
        // change path to match your actual dashboard component location
      import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    title: 'Dashboard — Vehicle Maintenance Tracker',
  },
//   {
//     path: 'vehicles',
//     loadComponent: () =>
//       import('./features/vehicles/vehicle-list.component').then(m => m.VehicleListComponent),
//     title: 'My Vehicles',
//   },
//   {
//     path: 'vehicles/:id',
//     loadComponent: () =>
//       import('./features/vehicles/vehicle-detail.component').then(m => m.VehicleDetailComponent),
//     title: 'Vehicle Details',
//   },
//   {
//     path: 'vehicles/:id/log',
//     loadComponent: () =>
//       import('./features/maintenance-log/maintenance-log.component').then(m => m.MaintenanceLogComponent),
//     title: 'Maintenance Log',
//   },
//   {
//     path: 'reminders',
//     loadComponent: () =>
//       import('./features/reminders/reminders.component').then(m => m.RemindersComponent),
//     title: 'Service Reminders',
//   },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];


