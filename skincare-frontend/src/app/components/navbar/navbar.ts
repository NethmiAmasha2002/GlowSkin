import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { AdminService } from '../../services/admin.service';
import { NotificationsComponent } from '../notifications/notifications';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationsComponent],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
 
  isScrolled = false;
  dropdownOpen = false;
 
  constructor(
    public cartService: CartService,
    public authService: AuthService,
    public adminService: AdminService,
    private router: Router
  ) {}
 
  ngOnInit() {}
 
  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 20;
  }
 
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }
 
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
 
  getUserName(): string {
    return this.authService.getCurrentUser()?.name || 'Account';
  }
 
  getUserInitial(): string {
    return this.authService.getCurrentUser()?.name?.charAt(0).toUpperCase() || 'U';
  }
 
  logout() {
    this.dropdownOpen = false;
    this.cartService.clearCart();       // ✅ Clear cart on logout
    this.authService.logout();
    this.router.navigate(['/']);        // ✅ Go to HOME on logout
  }
}