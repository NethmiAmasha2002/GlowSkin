import { Component, OnInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService, Product } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory = 'All';
  showLoginModal = false;
  isLoading = true;
  toastMsg = '';
  toastVisible = false;
  private toastTimer: any;
  visibleCards: Set<number> = new Set();

  categories = ['All', 'Moisturizer', 'Serum', 'Sunscreen', 'Face Wash', 'Toner'];

  private catIcons: Record<string, string> = {
    'All':         '✨',
    'Moisturizer': '💧',
    'Serum':       '🧪',
    'Sunscreen':   '☀️',
    'Face Wash':   '🌿',
    'Toner':       '🌸',
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public  authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.visibleCards.clear();
    this.http.get<Product[]>(`${environment.apiUrl}/api/products`).subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.isLoading = false;
        this.animateCards();
      },
      error: () => {
        this.productService.getAllProducts().subscribe({
          next: (data) => {
            this.products = data;
            this.filteredProducts = data;
            this.isLoading = false;
            this.animateCards();
          },
          error: () => { this.isLoading = false; }
        });
      }
    });
  }

  animateCards() {
    this.visibleCards.clear();
    this.cdr.detectChanges();
    setTimeout(() => {
      for (let i = 0; i < this.filteredProducts.length; i++) {
        this.visibleCards.add(i);
      }
      this.cdr.detectChanges();
    }, 100);
  }

  filterCategory(category: string) {
    this.selectedCategory = category;
    this.visibleCards.clear();
    this.cdr.detectChanges();
    this.filteredProducts = category === 'All'
      ? this.products
      : this.products.filter(p => p.category === category);
    setTimeout(() => {
      for (let i = 0; i < this.filteredProducts.length; i++) {
        this.visibleCards.add(i);
      }
      this.cdr.detectChanges();
    }, 50);
  }

  isVisible(index: number): boolean {
    return this.visibleCards.has(index);
  }

  getCatIcon(cat: string): string {
    return this.catIcons[cat] || '✨';
  }

  cartToastMsg = '';
  cartToastVisible = false;

  addToCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.showLoginModal = true;
      return;
    }
    this.cartService.addToCart(product);
    this.cartToastMsg = product.name;
    this.cartToastVisible = true;
    setTimeout(() => this.cartToastVisible = false, 2500);
  }

  showToast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg = msg;
    this.toastVisible = true;
    this.cdr.detectChanges();
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  goToLogin() {
    this.showLoginModal = false;
    this.router.navigate(['/login']);
  }

  hasClaimedOffer(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    const user = this.authService.getCurrentUser();
    if (!user) return true;
    return !!localStorage.getItem('glowskin_offer_claimed_' + user.email);
  }

  onImgError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x300/fdf0f4/c97b9b?text=GlowSkin';
  }
}