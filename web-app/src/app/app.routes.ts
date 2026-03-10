import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { RestaurantListComponent } from '@features/restaurants/components/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from '@features/restaurants/components/restaurant-detail/restaurant-detail.component';
import { RestaurantAnalyticsComponent } from '@features/restaurants/components/restaurant-analytics/restaurant-analytics.component';
import { OrderHistoryComponent } from '@features/orders/components/order-history/order-history.component';
import { RestaurantOrdersComponent } from '@features/orders/components/restaurant-orders/restaurant-orders.component';

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
    path: 'restaurants/:id/analytics',
    component: RestaurantAnalyticsComponent
  },
  {
    path: 'restaurants/:id/orders',
    component: RestaurantOrdersComponent
  },
  {
    path: 'orders/history',
    component: OrderHistoryComponent
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

