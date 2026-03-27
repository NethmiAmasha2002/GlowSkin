import { Component, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminService, Notification } from '../../services/admin.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrap" *ngIf="authService.isLoggedIn()">
      <button class="notif-btn" (click)="toggleOpen()" [class.has-unread]="unreadCount > 0">
        🔔 <span class="notif-text">Notifications</span>
        <span class="notif-badge" *ngIf="unreadCount > 0">{{unreadCount}}</span>
      </button>

      <div class="notif-dropdown" *ngIf="isOpen">
        <div class="notif-header">
          <strong>Notifications</strong>
          <span class="notif-sub">{{notifications.length}} total</span>
        </div>
        <div class="notif-empty" *ngIf="notifications.length === 0">
          🔔 No notifications yet
        </div>
        <div class="notif-list">
          <div class="notif-item"
               *ngFor="let n of notifications"
               [class.unread]="!n.read"
               [class.success]="n.type==='success'"
               [class.rejected]="n.type==='rejected'"
               (click)="markRead(n)">
            <div class="notif-msg">{{n.message}}</div>
            <div class="notif-date">{{n.date}}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationsComponent implements OnInit {

  isOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    public authService: AuthService,
    private adminService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() { this.loadNotifications(); }

  loadNotifications() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.adminService.getNotificationsForUser(user.email).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
      },
      error: () => console.error('Could not load notifications')
    });
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.loadNotifications();
  }

  markRead(n: Notification) {
    if (n.read) return;
    this.adminService.markNotifRead(n.id);
    n.read = true;
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrap')) this.isOpen = false;
  }
}