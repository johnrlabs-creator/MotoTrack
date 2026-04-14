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
      import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
    title: 'Dashboard — Vehicle Maintenance Tracker',
  },
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./components/vehicles-list/vehicles-list').then((m) => m.VehiclesListComponent),
    title: 'My Vehicles',
  },
  // {
  //   path: 'vehicles/:id',
  //   loadComponent: () =>
  //     import('./components/vehicles/vehicle-detail.component').then(
  //       (m) => m.VehicleDetailComponent,
  //     ),
  //   title: 'Vehicle Details',
  // },
  // {
  //   path: 'vehicles/:id/log',
  //   loadComponent: () =>
  //     import('./features/maintenance-log/maintenance-log.component').then(
  //       (m) => m.MaintenanceLogComponent,
  //     ),
  //   title: 'Maintenance Log',
  // },
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
