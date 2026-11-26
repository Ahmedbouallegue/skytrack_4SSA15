import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard').then((module) => module.Dashboard)
  },
  {
    path: 'stations/:id',
    loadComponent: () => import('./station-detail/station-detail').then((module) => module.StationDetail)
  },
  { path: '**', redirectTo: '' }
];
