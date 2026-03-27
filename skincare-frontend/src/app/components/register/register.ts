import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,
            MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMsg = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    if (!this.name || !this.email ||
        !this.password || !this.confirmPassword) {
      this.errorMsg = 'Please fill in all fields!';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match!';
      return;
    }
    const success = this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password
    });
    if (success) {
      this.router.navigate(['/login']);
    } else {
      this.errorMsg = 'Email already exists!';
    }
  }
}