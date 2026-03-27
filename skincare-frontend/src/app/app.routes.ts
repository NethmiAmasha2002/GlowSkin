import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProductsComponent } from './components/products/products';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { CartComponent } from './components/cart/cart';
import { AdminLoginComponent } from './components/admin-login/admin-login';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';
import { inject } from '@angular/core';
import { AdminService } from './services/admin.service';
import { Router } from '@angular/router';

const adminGuard = () => {
  const adminService = inject(AdminService);
  const router = inject(Router);
  if (adminService.isAdminLoggedIn()) return true;
  router.navigate(['/admin/login']);
  return false;
};

export const routes: Routes = [
  { path: '',                component: HomeComponent },
  { path: 'login',           component: LoginComponent },
  { path: 'register',        component: RegisterComponent },
  { path: 'products',        component: ProductsComponent },
  { path: 'products/:id',    component: ProductDetailComponent },
  { path: 'cart',            component: CartComponent },
  { path: 'admin/login',     component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
];