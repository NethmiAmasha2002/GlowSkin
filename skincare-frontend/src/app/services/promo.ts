import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
 
@Injectable({ providedIn: 'root' })
export class PromoService {
 
  private PROMO_KEY = 'glowskin_active_promo';
  private promoSubject = new BehaviorSubject<string>('');
  promo$ = this.promoSubject.asObservable();
 
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Load any saved promo on startup
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.PROMO_KEY);
      if (saved) this.promoSubject.next(saved);
    }
  }
 
  // Called when user clicks "Claim Offer" on home page
  claimOffer(code: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.PROMO_KEY, code);
    }
    this.promoSubject.next(code);
  }
 
  // Called by cart to get active promo
  getActivePromo(): string {
    return this.promoSubject.value;
  }
 
  // Called by cart after applying
  clearPromo() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.PROMO_KEY);
    }
    this.promoSubject.next('');
  }
 
  // Returns discount % for a given code
  getDiscount(code: string): number {
    const discounts: { [key: string]: number } = {
      'GLOW20': 20,
      'GLOW10': 10,
      'SKIN10': 10,
      'NEW10':  10,
    };
    return discounts[code.toUpperCase()] || 0;
  }
}