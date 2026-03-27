import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(user: User): boolean {
    if (!this.isBrowser()) return false;
    const users = this.getUsers();
    const exists = users.find(u => u.email === user.email);
    if (exists) return false;
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  login(email: string, password: string): boolean {
    if (!this.isBrowser()) return false;
    const users = this.getUsers();
    const user = users.find(
      u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser()) return null;
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private getUsers(): User[] {
    if (!this.isBrowser()) return [];
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }
}