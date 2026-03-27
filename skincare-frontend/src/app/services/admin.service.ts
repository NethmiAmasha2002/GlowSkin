import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  totalPrice: number;
  productNames: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  orderDate: string;
  adminNote?: string;
}

export interface Notification {
  id: string;
  email: string;
  message: string;
  type: 'success' | 'rejected' | 'info';
  read: boolean;
  date: string;
}

export interface Offer {
  code: string;
  discount: number;
  description: string;
  active: boolean;
}

export interface AdminAccount {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  private ADMIN_EMAIL    = 'admin@glowskin.com';
  private ADMIN_PASSWORD = 'admin123';
  private NOTIFS_KEY     = 'glowskin_notifications';
  private OFFERS_KEY     = 'glowskin_offers';
  private ADMIN_KEY      = 'glowskin_admin_session';
  private ADMINS_KEY     = 'glowskin_admins';
  private ADMIN_NAME_KEY = 'glowskin_admin_name';

  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const session = localStorage.getItem(this.ADMIN_KEY);
      if (session) this.isAdminSubject.next(true);
    }
  }

  // ===== ADMIN AUTH =====
  adminLogin(email: string, password: string): boolean {
    if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ADMIN_KEY, 'true');
        localStorage.setItem(this.ADMIN_NAME_KEY, 'Super Admin');
      }
      this.isAdminSubject.next(true);
      return true;
    }

    const admins = this.getAdminAccounts();
    const found = admins.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (found) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ADMIN_KEY, 'true');
        localStorage.setItem(this.ADMIN_NAME_KEY, found.name);
      }
      this.isAdminSubject.next(true);
      return true;
    }

    return false;
  }

  adminLogout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.ADMIN_KEY);
      localStorage.removeItem(this.ADMIN_NAME_KEY);
    }
    this.isAdminSubject.next(false);
  }

  isAdminLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem(this.ADMIN_KEY);
  }

  getCurrentAdminName(): string {
    if (!isPlatformBrowser(this.platformId)) return 'Admin';
    return localStorage.getItem(this.ADMIN_NAME_KEY) || 'Admin';
  }

  // ===== MULTI-ADMIN MANAGEMENT =====
  getAdminAccounts(): AdminAccount[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const stored = localStorage.getItem(this.ADMINS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  addAdminAccount(name: string, email: string, password: string): { success: boolean; message: string } {
    if (!isPlatformBrowser(this.platformId)) return { success: false, message: 'Not available' };
    if (email.toLowerCase() === this.ADMIN_EMAIL.toLowerCase()) {
      return { success: false, message: 'This email is already a super admin!' };
    }
    const admins = this.getAdminAccounts();
    if (admins.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An admin with this email already exists!' };
    }
    admins.push({ name, email, password });
    localStorage.setItem(this.ADMINS_KEY, JSON.stringify(admins));
    return { success: true, message: 'Admin account created successfully!' };
  }

  removeAdminAccount(email: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const admins = this.getAdminAccounts().filter(
      a => a.email.toLowerCase() !== email.toLowerCase()
    );
    localStorage.setItem(this.ADMINS_KEY, JSON.stringify(admins));
  }

  // ===== ORDERS (API) =====
  getOrdersFromApi(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${environment.apiUrl}/api/orders`);
  }

  saveOrder(order: AdminOrder) {
    // Orders are saved via cart.ts directly to the API
  }

 acceptOrder(orderId: string, order: AdminOrder) {
    this.http.put(`${environment.apiUrl}/api/orders/${orderId}/status`, {
      status: 'ACCEPTED'
    }).subscribe({
      next: () => console.log('Order accepted'),
      error: (e) => console.error('Accept error', e)
    });

    this.addNotification(order.customerEmail, {
      message: `🎉 Your order has been ACCEPTED! We will deliver to ${order.city} soon.`,
      type: 'success'
    });
  }

  rejectOrder(orderId: string, reason: string, order: AdminOrder) {
    this.http.put(`${environment.apiUrl}/api/orders/${orderId}/status`, {
      status: 'REJECTED',
      adminNote: reason
    }).subscribe();

    this.addNotification(order.customerEmail, {
      message: `❌ Your order #${orderId.toString().slice(-6).toUpperCase()} was not accepted. Reason: ${reason}.`,
      type: 'rejected'
    });
  }

  // ===== EMAIL =====
  private sendEmailNotification(email: string, name: string, subject: string, body: string) {
    this.http.post(`${environment.apiUrl}/api/orders/notify`, {
      email, name, subject, body
    }).subscribe({ error: () => {} });
  }

  // ===== NOTIFICATIONS =====
addNotification(email: string, data: { message: string; type: 'success' | 'rejected' | 'info' }) {
  this.http.post(`${environment.apiUrl}/api/notifications`, {
    email,
    message: data.message,
    type: data.type
  }).subscribe({
    next: () => console.log('Notification saved'),
    error: (e) => console.error('Notification error', e)
  });
}
getNotificationsForUser(email: string): Observable<Notification[]> {
  return this.http.get<Notification[]>(`${environment.apiUrl}/api/notifications?email=${email}`);
}

markNotifRead(id: string) {
  this.http.put(`${environment.apiUrl}/api/notifications/${id}/read`, {}).subscribe();
}

  getUnreadCount(email: string): Observable<number> {
  return this.getNotificationsForUser(email).pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );
}
// ===== MESSAGES (API) =====
  getMessages(): Observable<any[]> {
    return this.http.get<any[]>(`\${environment.apiUrl}/api/messages`);
  }

  getMessagesForUser(email: string): Observable<any[]> {
    return this.http.get<any[]>(`\${environment.apiUrl}/api/messages/user?email=\${email}`);
  }

  sendMessage(data: { name: string; email: string; subject: string; message: string }): Observable<any> {
    return this.http.post(`\${environment.apiUrl}/api/messages`, data);
  }

  replyToMessage(id: number, replyText: string): Observable<any> {
    return this.http.put(`\${environment.apiUrl}/api/messages/\${id}/reply`, { replyText });
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`\${environment.apiUrl}/api/messages/\${id}`);
  }

  markMessageRead(id: number): Observable<any> {
    return this.http.put(`\${environment.apiUrl}/api/messages/\${id}/read`, {});
  }
  // ===== OFFERS =====
  getOffers(): Offer[] {
    if (!isPlatformBrowser(this.platformId)) return this.defaultOffers();
    const stored = localStorage.getItem(this.OFFERS_KEY);
    return stored ? JSON.parse(stored) : this.defaultOffers();
  }

  saveOffers(offers: Offer[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.OFFERS_KEY, JSON.stringify(offers));
  }

  getDiscount(code: string): number {
    const offers = this.getOffers();
    const offer = offers.find(o => o.code.toUpperCase() === code.toUpperCase() && o.active);
    return offer ? offer.discount : 0;
  }

  private defaultOffers(): Offer[] {
    return [
      { code: 'GLOW20', discount: 20, description: 'New customer welcome offer', active: true },
      { code: 'GLOW10', discount: 10, description: 'Loyalty discount', active: true },
      { code: 'SKIN10', discount: 10, description: 'Skincare week special', active: true },
    ];
  }
}