import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { PromoService } from '../../services/promo';
import { AdminService } from '../../services/admin.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {

  cartItems: CartItem[] = [];
  promoCode = '';
  promoSuccess = false;
  promoDiscount = 0;
  isPlacing = false;
  orderPlaced = false;
  placedOrderId = '';
  totalItems: number = 0;
  address = { name: '', email: '', phone: '', street: '', city: '' };

  constructor(
    private cartService: CartService,
    private promoService: PromoService,
    private adminService: AdminService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartItems = this.cartService.getCartItems();

    const activePromo = this.promoService.getActivePromo();
    if (activePromo) {
      this.promoCode = activePromo;
      this.promoDiscount = this.adminService.getDiscount(activePromo);
      if (this.promoDiscount > 0) {
        this.promoSuccess = true;
      }
      this.promoService.clearPromo();
    }
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => {
      const discount = (item as any).discount;
      const price = discount && discount > 0
        ? item.price - (item.price * discount / 100)
        : item.price;
      return sum + price * item.quantity;
    }, 0);
  }

  get discount(): number {
    return this.promoSuccess ? (this.subtotal * this.promoDiscount / 100) : 0;
  }

  get total(): number {
    return this.subtotal - this.discount;
  }

  getItemPrice(item: any): number {
    if (item.discount && item.discount > 0) {
      return item.price - (item.price * item.discount / 100);
    }
    return item.price;
  }

  isFormValid(): boolean {
    return !!(this.address.name && this.address.email &&
              this.address.phone && this.address.street && this.address.city);
  }

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty <= 0) this.removeItem(item);
    else {
      item.quantity = newQty;
      this.cartService.updateCartItems(this.cartItems);
    }
  }

  removeItem(item: CartItem) {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.cartService.updateCartItems(this.cartItems);
  }

  applyPromo() {
    const code = this.promoCode.trim().toUpperCase();
    const discount = this.adminService.getDiscount(code);
    if (discount > 0) {
      this.promoDiscount = discount;
      this.promoSuccess = true;
    } else {
      alert('Invalid or inactive promo code!');
    }
  }

placeOrder() {
  if (!this.isFormValid() || this.isPlacing) return;
  this.isPlacing = true;

  this.placedOrderId = Date.now().toString();
  const orderData = {
    customerName:  this.address.name,
    customerEmail: this.address.email,
    customerPhone: this.address.phone,
    streetAddress: this.address.street,
    city:          this.address.city,
    totalPrice:    this.total,
    status:        'PENDING',
    orderDate:     new Date().toISOString(),
    productNames:  this.cartItems.map(i => i.name)
  };

  this.http.post(`${environment.apiUrl}/api/orders/place`, orderData).subscribe({
    next:  () => this.onOrderSuccess(),
    error: () => this.onOrderSuccess()
  });
}

  onOrderSuccess() {
    this.isPlacing = false;
    this.orderPlaced = true;
    this.cartService.clearCart();
    this.cartItems = [];
  }

  onImgError(event: any) {
    event.target.src = 'https://via.placeholder.com/90x90/fdf0f4/c97b9b?text=Skin';
  }
}