import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { RestaurantListComponent } from '@features/restaurants/components/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from '@features/restaurants/components/restaurant-detail/restaurant-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'restaurants',
    component: RestaurantListComponent
  },
  {
    path: 'restaurants/:id',
    component: RestaurantDetailComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  },
  
];
