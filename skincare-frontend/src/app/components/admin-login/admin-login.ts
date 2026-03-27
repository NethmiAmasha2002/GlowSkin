import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
 
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss']
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = '';
  showPass = false;
 
  constructor(private adminService: AdminService, private router: Router) {}
 
  login() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields!';
      return;
    }
    const success = this.adminService.adminLogin(this.email, this.password);
    if (success) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error = 'Invalid admin credentials!';
    }
  }
}
 