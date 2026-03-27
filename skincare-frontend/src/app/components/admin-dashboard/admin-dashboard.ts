import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminService, AdminOrder, Offer, AdminAccount } from '../../services/admin.service';
import { Product } from '../../services/cart';
import { environment } from '../../../environments/environment';

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  replied?: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {

  activeTab: 'orders' | 'products' | 'offers' | 'admins' | 'messages' = 'orders';

  // Orders
  orders: AdminOrder[] = [];
  rejectReason = '';
  rejectingOrderId = '';
  showRejectModal = false;

  // Products
  products: Product[] = [];
  showProductModal = false;
  editingProduct: Partial<Product> = {};
  isEditMode = false;
  productError = '';

  // Offers
  offers: Offer[] = [];
  newOffer: Offer = { code: '', discount: 0, description: '', active: true };
  showOfferForm = false;

  // Admin accounts
  adminAccounts: AdminAccount[] = [];
  showAdminForm = false;
  newAdmin = { name: '', email: '', password: '' };
  adminMsg = '';
  adminMsgType: 'success' | 'error' = 'success';

  // Messages
  messages: ContactMessage[] = [];
  replyingIndex: number | null = null;
  replyText = '';

  // Toast
  toastMsg = '';
  toastType: 'success' | 'error' = 'success';

  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(
    private adminService: AdminService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.adminService.isAdminLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadOrders();
    this.loadProducts();
    this.loadMessages();
    this.offers = this.adminService.getOffers();
    this.adminAccounts = this.adminService.getAdminAccounts();
  }

  get adminName() { return this.adminService.getCurrentAdminName(); }

  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3000);
  }

  // ===== ORDERS =====
  loadOrders() {
    this.http.get<any[]>('http://44.195.47.67:8080/api/orders').subscribe({
      next: (data) => this.orders = data,
      error: () => this.showToast('Could not load orders', 'error')
    });
  }

  acceptOrder(id: any) {
    this.http.put(`http://44.195.47.67:8080/api/orders/${id}/status`,
      { status: 'ACCEPTED' }
    ).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id == id);
        if (order) {
          this.http.post('http://44.195.47.67:8080/api/notifications', {
            email: order.customerEmail,
            message: `🎉 Your order has been ACCEPTED! We will deliver to ${order.city} soon.`,
            type: 'success'
          }).subscribe();
        }
        this.loadOrders();
        this.showToast('Order accepted! ✅');
      },
      error: (err) => {
        console.error('Accept error:', err);
        this.showToast('Failed to accept order.', 'error');
      }
    });
  }

  openRejectModal(id: any) {
    this.rejectingOrderId = id;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject() {
    if (!this.rejectReason.trim()) return;
    this.http.put(`http://44.195.47.67:8080/api/orders/${this.rejectingOrderId}/status`,
      { status: 'REJECTED', adminNote: this.rejectReason }
    ).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id == this.rejectingOrderId);
        if (order) {
          this.http.post('http://44.195.47.67:8080/api/notifications', {
            email: order.customerEmail,
            message: `❌ Your order was rejected. Reason: ${this.rejectReason}`,
            type: 'rejected'
          }).subscribe();
        }
        this.showRejectModal = false;
        this.loadOrders();
        this.showToast('Order rejected ❌');
      },
      error: () => this.showToast('Failed to reject order.', 'error')
    });
  }

  getStatusClass(status: string) {
    return { 'PENDING': 'badge-pending', 'ACCEPTED': 'badge-accepted', 'REJECTED': 'badge-rejected' }[status] || '';
  }

  get pendingCount() { return this.orders.filter(o => o.status === 'PENDING').length; }
  get acceptedCount() { return this.orders.filter(o => o.status === 'ACCEPTED').length; }
  get rejectedCount() { return this.orders.filter(o => o.status === 'REJECTED').length; }

  // ===== PRODUCTS =====
  loadProducts() {
    this.http.get<Product[]>('http://44.195.47.67:8080/api/products').subscribe({
      next: (data) => this.products = data,
      error: () => this.showToast('Could not load products', 'error')
    });
  }

  openAddProduct() {
    this.editingProduct = { name: '', category: 'Moisturizer', price: 0, description: '', imageUrl: '', discount: 0 };
    this.isEditMode = false;
    this.productError = '';
    this.showProductModal = true;
  }

  openEditProduct(p: Product) {
    this.editingProduct = { ...p };
    this.isEditMode = true;
    this.productError = '';
    this.showProductModal = true;
  }

  saveProduct() {
    if (!this.editingProduct.name?.trim()) { this.productError = 'Product name is required!'; return; }
    if (!this.editingProduct.price || this.editingProduct.price <= 0) { this.productError = 'Valid price is required!'; return; }
    if (!this.editingProduct.category) { this.productError = 'Category is required!'; return; }
    this.productError = '';

    const payload = {
      name: this.editingProduct.name,
      category: this.editingProduct.category,
      price: this.editingProduct.price,
      description: this.editingProduct.description || '',
      imageUrl: this.editingProduct.imageUrl || '',
      discount: this.editingProduct.discount || 0
    };

    if (this.isEditMode && this.editingProduct.id) {
      this.http.put<Product>(`${this.apiUrl}/${this.editingProduct.id}`, payload).subscribe({
        next: () => { this.showProductModal = false; this.loadProducts(); this.showToast('Product updated! ✅'); },
        error: () => { this.productError = 'Failed to update. Check backend.'; }
      });
    } else {
      this.http.post<Product>(this.apiUrl, payload).subscribe({
        next: () => { this.showProductModal = false; this.loadProducts(); this.showToast('Product added! ✅'); },
        error: () => { this.productError = 'Failed to add product. Check backend.'; }
      });
    }
  }

  deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => { this.loadProducts(); this.showToast('Product deleted.'); },
      error: () => this.showToast('Could not delete product.', 'error')
    });
  }

  // ===== OFFERS =====
  saveOffer() {
    if (!this.newOffer.code || !this.newOffer.discount) return;
    this.offers.push({ ...this.newOffer, code: this.newOffer.code.toUpperCase() });
    this.adminService.saveOffers(this.offers);
    this.newOffer = { code: '', discount: 0, description: '', active: true };
    this.showOfferForm = false;
    this.showToast('Promo code added! 🎁');
  }

  toggleOffer(offer: Offer) {
    offer.active = !offer.active;
    this.adminService.saveOffers(this.offers);
  }

  deleteOffer(index: number) {
    this.offers.splice(index, 1);
    this.adminService.saveOffers(this.offers);
    this.showToast('Offer deleted.');
  }

  // ===== ADMIN ACCOUNTS =====
  addAdminAccount() {
    if (!this.newAdmin.name || !this.newAdmin.email || !this.newAdmin.password) {
      this.adminMsg = 'All fields are required!';
      this.adminMsgType = 'error';
      return;
    }
    const result = this.adminService.addAdminAccount(
      this.newAdmin.name, this.newAdmin.email, this.newAdmin.password
    );
    this.adminMsg = result.message;
    this.adminMsgType = result.success ? 'success' : 'error';
    if (result.success) {
      this.adminAccounts = this.adminService.getAdminAccounts();
      this.newAdmin = { name: '', email: '', password: '' };
      this.showAdminForm = false;
      this.showToast('New admin created! 👤');
    }
  }

  removeAdmin(email: string) {
    if (!confirm('Remove this admin account?')) return;
    this.adminService.removeAdminAccount(email);
    this.adminAccounts = this.adminService.getAdminAccounts();
    this.showToast('Admin removed.');
  }

  // ===== MESSAGES =====
  loadMessages() {
    this.http.get<ContactMessage[]>('http://44.195.47.67:8080/api/messages').subscribe({
      next: (data) => this.messages = data,
      error: () => this.showToast('Could not load messages', 'error')
    });
  }

  get unreadMessageCount() {
    return this.messages.filter(m => !m.read).length;
  }

  openReply(index: number) {
    this.replyingIndex = index;
    this.replyText = '';
    this.markMessageRead(index);
  }

  markMessageRead(index: number) {
    const msg = this.messages[index];
    if (!msg.read && msg.id) {
      this.http.put(`http://44.195.47.67:8080/api/messages/${msg.id}/read`, {}).subscribe();
      this.messages[index].read = true;
    }
  }

  markAllMessagesRead() {
    this.messages.forEach((msg, i) => {
      if (!msg.read && msg.id) {
        this.http.put(`http://44.195.47.67:8080/api/messages/${msg.id}/read`, {}).subscribe();
        this.messages[i].read = true;
      }
    });
  }

  deleteMessage(index: number) {
    const msg = this.messages[index];
    if (msg.id) {
      this.http.delete(`http://44.195.47.67:8080/api/messages/${msg.id}`).subscribe({
        next: () => {
          this.messages.splice(index, 1);
          this.showToast('Message deleted.');
        }
      });
    } else {
      this.messages.splice(index, 1);
    }
  }

  sendReply() {
    if (!this.replyText.trim() || this.replyingIndex === null) return;
    const msg = this.messages[this.replyingIndex];

    if (msg.id) {
      this.http.put(`http://44.195.47.67:8080/api/messages/${msg.id}/reply`,
        { replyText: this.replyText.trim() }
      ).subscribe();
    }

    this.http.post('http://44.195.47.67:8080/api/notifications', {
      email: msg.email,
      message: `💌 Reply from GlowSkin Team: "${this.replyText.trim()}"`,
      type: 'info'
    }).subscribe();

    this.messages[this.replyingIndex].replied = true;
    this.replyingIndex = null;
    this.replyText = '';
    this.showToast('Reply sent! 💌');
  }

  // ===== LOGOUT =====
  logout() {
    this.adminService.adminLogout();
    this.router.navigate(['/login']);
  }
}