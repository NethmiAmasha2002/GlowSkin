import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
 
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  discount?: number;
}
 
export interface CartItem extends Product {
  quantity: number;
}
 
@Injectable({ providedIn: 'root' })
export class CartService {
 
  private isBrowser: boolean;
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();
 
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.cartSubject.next(this.loadCart());
  }
 
  // ✅ Cart key is per-user (uses email) so each user has their own cart
  private getCartKey(): string {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user?.email ? 'glowskin_cart_' + user.email : 'glowskin_cart_guest';
    } catch {
      return 'glowskin_cart_guest';
    }
  }
 
  private loadCart(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(this.getCartKey());
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
 
  private saveCart(items: CartItem[]) {
    if (this.isBrowser) {
      localStorage.setItem(this.getCartKey(), JSON.stringify(items));
    }
    this.cartSubject.next(items);
  }
 
  // ✅ Call this after login so cart loads for the new user
  reloadCartForUser() {
    this.cartSubject.next(this.loadCart());
  }
 
  getCartItems(): CartItem[] {
    return this.cartSubject.value;
  }
 
  getTotalCount(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }
 
  addToCart(product: Product) {
    const items = [...this.cartSubject.value];
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...product, quantity: 1 });
    }
    this.saveCart(items);
  }
 
  updateCartItems(items: CartItem[]) {
    this.saveCart([...items]);
  }
 
  removeFromCart(productId: number) {
    this.saveCart(this.cartSubject.value.filter(i => i.id !== productId));
  }
 
  clearCart() {
    this.saveCart([]);
  }
}