import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private adminService: AdminService,
    private router: Router
  ) {}

  login(): void {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please fill in all fields!';
      return;
    }

    // ✅ Check admin first
    const isAdmin = this.adminService.adminLogin(this.email, this.password);
    if (isAdmin) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    // ✅ Then check regular user
    const isUser = this.authService.login(this.email, this.password);
    if (isUser) {
      this.cartService.reloadCartForUser();
      this.router.navigate(['/']);
    } else {
      this.errorMsg = 'Invalid email or password!';
    }
  }
}