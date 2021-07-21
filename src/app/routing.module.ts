import { Routes } from '@angular/router';
import { MainViewComponent } from './pages/main.component';
import { TestComponent } from './pages/test.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: MainViewComponent
  },
  {
    path: 'test',
    component: TestComponent
  }
];
