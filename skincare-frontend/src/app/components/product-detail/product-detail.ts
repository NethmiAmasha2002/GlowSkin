import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService, Product } from '../../services/cart';

interface Review {
  id?: number;
  productId: number;
  productName: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ← removed DecimalPipe
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent implements OnInit {

  product: Product | null = null;
  reviews: Review[] = [];
  quantity = 1;
  activeTab: 'desc' | 'reviews' = 'desc';
  stars = [1, 2, 3, 4, 5];

  newReview = { reviewer: '', rating: 0, comment: '' };
  hoverRating = 0;
  reviewSubmitting = false;
  reviewSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
      this.loadReviews(id);
    });
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (p) => { this.product = p; this.cdr.markForCheck(); },
      error: () => console.error('Product not found')
    });
  }

  loadReviews(productId: number) {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('glowskin_reviews');
    if (stored) {
      const allReviews: Review[] = JSON.parse(stored);
      this.reviews = allReviews.filter(r => r.productId === productId);
      this.cdr.markForCheck();
    }
  }

  get avgRating(): number {
    if (!this.reviews.length) return 0;
    return this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  }

  get ratingStars(): number[] { return [1, 2, 3, 4, 5]; }

  getStars(rating: number): number[] { return [1, 2, 3, 4, 5]; }
  getAverageRating(): number { return this.avgRating; }

  setHoverRating(r: number) { this.hoverRating = r; }
  clearHoverRating() { this.hoverRating = 0; }
  setRating(r: number) { this.newReview.rating = r; }
cartToastVisible = false;
addToCart() {
  if (!this.product) return;
  for (let i = 0; i < this.quantity; i++) {
    this.cartService.addToCart(this.product);
  }
  this.cartToastVisible = true;
  setTimeout(() => this.cartToastVisible = false, 2500);
}

  submitReview() {
    if (!this.product || !this.newReview.reviewer.trim() ||
        !this.newReview.comment.trim() || !this.newReview.rating) return;

    this.reviewSubmitting = true;

    const review: Review = {
      productId: this.product.id,
      productName: this.product.name,
      reviewer: this.newReview.reviewer.trim(),
      rating: this.newReview.rating,
      comment: this.newReview.comment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    this.saveReviewLocally(review);

    setTimeout(() => {
      this.reviews = [...this.reviews, review];
      this.newReview = { reviewer: '', rating: 0, comment: '' };
      this.reviewSubmitting = false;
      this.reviewSubmitted = true;
      this.cdr.markForCheck();
      setTimeout(() => { this.reviewSubmitted = false; this.cdr.markForCheck(); }, 3000);
    }, 600);
  }

  private saveReviewLocally(review: Review) {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('glowskin_reviews');
    const allReviews: Review[] = stored ? JSON.parse(stored) : [];
    allReviews.push(review);
    localStorage.setItem('glowskin_reviews', JSON.stringify(allReviews));
  }

  onImgError(event: any) {
    if (this.product) {
      event.target.src = 'https://via.placeholder.com/400x400/fdf0f4/c97b9b?text=' + this.product.name;
    }
  }
}