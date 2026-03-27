import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService, Product } from '../../services/cart';
import { PromoService } from '../../services/promo';
import { AuthService } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  allProducts: Product[] = [];
  displayedProducts: Product[] = [];
  activeCategory = '';
  messageSent = false;
  toastMsg = '';
  toastVisible = false;
  toastTimer: any;

  offerClaimed   = false;
  offerError     = '';

  showLoginPopup = false;

  contact = { name: '', email: '', subject: '', message: '' };
  categories = ['Moisturizer', 'Serum', 'Sunscreen', 'Face Wash', 'Toner'];

  deals = [
    { name: 'Vitamin C Serum',  badge: '30% OFF', oldPrice: '34.99', newPrice: '24.49', image: 'https://tse1.mm.bing.net/th/id/OIP.Egv90_vaYjYW3cgKV7a8GQHaHQ?pid=Api&h=220&P=0' },
    { name: 'Glow Moisturizer', badge: '20% OFF', oldPrice: '24.99', newPrice: '19.99', image: 'https://iwhitekorea.com.ph/wp-content/uploads/2021/09/PB_Aqua-copy-21-min.jpg' },
    { name: 'SPF 50 Sunscreen', badge: '25% OFF', oldPrice: '19.99', newPrice: '14.99', image: 'https://tse1.mm.bing.net/th/id/OIP.1WV5cbJXybtl4j-gP_VJcgHaHa?pid=Api&h=220&P=0' }
  ];

  values = [
    { icon: '🌿', title: 'Clean Ingredients', desc: 'No parabens, sulfates, or harmful chemicals' },
    { icon: '🔬', title: 'Science-Backed',    desc: 'Every formula clinically tested and approved' },
    { icon: '🌍', title: 'Sustainable',       desc: 'Eco-friendly packaging, cruelty-free always' }
  ];

  steps = [
    { icon: '🧴', title: 'Cleanse',    desc: 'Start with a gentle cleanser to remove dirt and oil.' },
    { icon: '💧', title: 'Treat',      desc: 'Apply serum or toner to address specific skin concerns.' },
    { icon: '✨', title: 'Moisturize', desc: 'Lock in hydration with the perfect moisturizer.' }
  ];

  sampleReviews = [
    { name: 'Sarah M.',  rating: 5, comment: 'My skin has never looked better! The Vitamin C Serum is absolutely life-changing.', product: 'Vitamin C Serum' },
    { name: 'Priya K.',  rating: 5, comment: 'I was skeptical but this moisturizer genuinely transformed my dry skin.', product: 'Glow Moisturizer' },
    { name: 'Emma L.',   rating: 5, comment: 'Finally a sunscreen that does not leave a white cast! I wear it every day.', product: 'SPF 50 Sunscreen' },
    { name: 'Diana R.',  rating: 4, comment: 'The Rose Toner is so refreshing. My pores look visibly smaller.', product: 'Rose Toner' },
    { name: 'Aisha B.',  rating: 5, comment: 'GlowSkin products are the only thing that worked for my sensitive skin!', product: 'Gentle Face Wash' },
    { name: 'Nina T.',   rating: 5, comment: 'The Hyaluronic Serum keeps my skin plump all day. Obsessed!', product: 'Hyaluronic Serum' }
  ];

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private promoService: PromoService,
    public  authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.http.get<Product[]>(`${environment.apiUrl}/api/products`).subscribe({
      next: (p) => { this.allProducts = p; this.displayedProducts = p.slice(0, 8); },
      error: ()  => { this.allProducts = this.getSampleProducts(); this.displayedProducts = this.allProducts.slice(0, 8); }
    });
  }

  filterProducts(category: string) {
    this.activeCategory = category;
    const filtered = category ? this.allProducts.filter(p => p.category === category) : this.allProducts;
    this.displayedProducts = filtered.slice(0, 8);
  }

  addToCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.showLoginPopup = true;
      return;
    }
    this.cartService.addToCart(product);
    this.showCartToast(product.name);
  }

  cartToastMsg = '';
  cartToastVisible = false;

  showCartToast(name: string) {
    this.cartToastMsg = name;
    this.cartToastVisible = true;
    setTimeout(() => this.cartToastVisible = false, 2500);
  }

  dismissLoginPopup() { this.showLoginPopup = false; }

  goToLogin() {
    this.showLoginPopup = false;
    this.router.navigate(['/login']);
  }

  claimOffer() {
    this.offerError = '';

    if (!this.authService.isLoggedIn()) {
      this.offerError = 'login';
      return;
    }

    const user = this.authService.getCurrentUser();
    const claimedKey = 'glowskin_offer_claimed_' + user?.email;

    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(claimedKey)) {
        this.offerError = 'used';
        return;
      }
      localStorage.setItem(claimedKey, 'true');
    }

    this.promoService.claimOffer('GLOW20');
    this.offerClaimed = true;

    setTimeout(() => {
      this.offerClaimed = false;
      this.router.navigate(['/cart']);
    }, 1800);
  }

  dismissOfferError() { this.offerError = ''; }

sendMessage() {
  if (!this.contact.name || !this.contact.email || !this.contact.message) return;
  
  this.http.post(`${environment.apiUrl}/api/messages`, this.contact).subscribe({
    next: () => {
      this.messageSent = true;
      this.contact = { name: '', email: '', subject: '', message: '' };
      setTimeout(() => this.messageSent = false, 4000);
    },
    error: () => {
      this.messageSent = true; // still show success to user
      this.contact = { name: '', email: '', subject: '', message: '' };
      setTimeout(() => this.messageSent = false, 4000);
    }
  });
}

  onImgError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x300/fdf0f4/c97b9b?text=GlowSkin';
  }

  getSampleProducts(): Product[] {
    return [
      { id: 1, name: 'Glow Moisturizer',   category: 'Moisturizer', price: 24.99, description: 'Deep hydration for glowing skin',   imageUrl: 'https://iwhitekorea.com.ph/wp-content/uploads/2021/09/PB_Aqua-copy-21-min.jpg' },
      { id: 2, name: 'Hydra Boost Cream',  category: 'Moisturizer', price: 29.99, description: 'Intense moisture for dry skin',      imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.THZC_OeMeqxaY9Zt3pZo1gHaHa?pid=Api&h=220' },
      { id: 3, name: 'Vitamin C Serum',    category: 'Serum',       price: 34.99, description: 'Brightens and evens skin tone',      imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.Egv90_vaYjYW3cgKV7a8GQHaHQ?pid=Api&h=220' },
      { id: 4, name: 'Hyaluronic Serum',   category: 'Serum',       price: 29.99, description: 'Deep hydration serum',               imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.hnAUml0D6RqNGtexfoObuQHaHa?pid=Api&h=220' },
      { id: 5, name: 'SPF 50 Sunscreen',   category: 'Sunscreen',   price: 19.99, description: 'Lightweight daily sun protection',   imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.1WV5cbJXybtl4j-gP_VJcgHaHa?pid=Api&h=220' },
      { id: 6, name: 'Gentle Face Wash',   category: 'Face Wash',   price: 14.99, description: 'Cleanses without drying',            imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3jehY7BrPROeFq7vCTpOxi_Wmo3D3PGMVIA&s' },
      { id: 7, name: 'Rose Toner',         category: 'Toner',       price: 18.99, description: 'Balances and refreshes skin',        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR65S88LDwkhBINcreCwnyY_u87nP5ucGIT0g&s' },
      { id: 8, name: 'Night Repair Cream', category: 'Moisturizer', price: 39.99, description: 'Repairs skin while you sleep',       imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.66jaDSADdGDZHvA34Io3sgHaHa?pid=Api&h=220' },
    ];
  }
}