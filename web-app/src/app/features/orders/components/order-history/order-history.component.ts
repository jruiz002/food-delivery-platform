import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../../services/orders.service';
import { ReviewsService } from '../../../reviews/services/reviews.service';
import { AuthService } from '@core/services/auth.service';
import { Review } from '../../../reviews/models/review.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private reviewsService = inject(ReviewsService);
  private authService = inject(AuthService);

  orders = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Map de orderId → Review ya existente (cargada del backend al iniciar)
  reviewsByOrderId = signal<Map<string, Review>>(new Map());

  // Review modal
  showReviewModal = signal(false);
  reviewOrder = signal<any | null>(null);
  reviewRating = signal(0);
  reviewComment = signal('');
  submittingReview = signal(false);
  reviewError = signal<string | null>(null);
  // 'create' | 'edit' — modo del modal
  reviewModalMode = signal<'create' | 'edit'>('create');

  // Confirm delete
  showDeleteConfirm = signal(false);
  deletingReview = signal(false);
  deleteError = signal<string | null>(null);
  deleteTargetOrderId = signal<string | null>(null);

  // Bulk selection
  selectionMode = signal(false);
  selectedReviewIds = signal<Set<string>>(new Set());
  showBatchDeleteConfirm = signal(false);
  deletingBatch = signal(false);
  batchDeleteError = signal<string | null>(null);

  currentUser = this.authService.currentUser;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);
    this.error.set(null);

    this.ordersService.getHistory({ limit: 50, sortOrder: 'desc' }).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
        // Cargar reviews del usuario para saber cuáles órdenes ya tienen reseña
        this.loadUserReviews();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar el historial.');
        this.loading.set(false);
      }
    });
  }

  /** Carga todas las reviews del sistema y filtra las del usuario actual */
  private loadUserReviews() {
    const userId = this.currentUser()?._id;
    if (!userId) return;

    this.reviewsService.getAll({ limit: 10000 }).subscribe({
      next: (reviews) => {
        const map = new Map<string, Review>();
        reviews
          .filter(r => String(r.user_id) === userId)
          .forEach(r => {
            if (r.order_id) map.set(String(r.order_id), r);
          });
        this.reviewsByOrderId.set(map);
      },
      error: () => {}
    });
  }

  existingReview(orderId: string): Review | undefined {
    return this.reviewsByOrderId().get(orderId);
  }

  canReview(order: any): boolean {
    return order.status === 'Delivered';
  }

  hasReview(orderId: string): boolean {
    return this.reviewsByOrderId().has(orderId);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'status-pending',
      Preparing: 'status-preparing',
      Delivered: 'status-delivered',
      Cancelled: 'status-cancelled'
    };
    return map[status] || '';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      Pending: 'schedule',
      Preparing: 'restaurant',
      Delivered: 'check_circle',
      Cancelled: 'cancel'
    };
    return map[status] || 'help';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  formatPrice(amount: any): string {
    const num = typeof amount === 'object' && amount.$numberDecimal
      ? parseFloat(amount.$numberDecimal)
      : parseFloat(amount);
    return `$${num.toFixed(2)}`;
  }

  // ── Modal de Crear/Editar ────────────────────────────────────────────────

  openCreateModal(order: any) {
    this.reviewOrder.set(order);
    this.reviewRating.set(0);
    this.reviewComment.set('');
    this.reviewError.set(null);
    this.reviewModalMode.set('create');
    this.showReviewModal.set(true);
  }

  openEditModal(order: any) {
    const existing = this.existingReview(order._id);
    if (!existing) return;
    this.reviewOrder.set(order);
    this.reviewRating.set(existing.rating);
    this.reviewComment.set(existing.comment ?? '');
    this.reviewError.set(null);
    this.reviewModalMode.set('edit');
    this.showReviewModal.set(true);
  }

  closeReviewModal() {
    this.showReviewModal.set(false);
    this.reviewOrder.set(null);
    this.reviewError.set(null);
  }

  setRating(rating: number) {
    this.reviewRating.set(rating);
  }

  submitReview() {
    const order = this.reviewOrder();
    if (!order || this.reviewRating() === 0) return;

    this.submittingReview.set(true);
    this.reviewError.set(null);

    if (this.reviewModalMode() === 'create') {
      this.reviewsService.create({
        userId: this.currentUser()!._id,
        restaurantId: order.restaurant._id,
        orderId: order._id,
        rating: this.reviewRating(),
        comment: this.reviewComment() || undefined
      }).subscribe({
        next: (created) => {
          this.submittingReview.set(false);
          const map = new Map(this.reviewsByOrderId());
          map.set(order._id, created);
          this.reviewsByOrderId.set(map);
          this.closeReviewModal();
        },
        error: (err) => {
          this.submittingReview.set(false);
          this.reviewError.set(err.error?.message || 'Error al enviar la reseña.');
        }
      });
    } else {
      // edit mode
      const existing = this.existingReview(order._id);
      if (!existing) return;
      this.reviewsService.update(existing._id, {
        rating: this.reviewRating(),
        comment: this.reviewComment() || undefined
      }).subscribe({
        next: (updated) => {
          this.submittingReview.set(false);
          const map = new Map(this.reviewsByOrderId());
          map.set(order._id, updated);
          this.reviewsByOrderId.set(map);
          this.closeReviewModal();
        },
        error: (err) => {
          this.submittingReview.set(false);
          this.reviewError.set(err.error?.message || 'Error al actualizar la reseña.');
        }
      });
    }
  }

  // ── Eliminar ────────────────────────────────────────────────────────────

  openDeleteConfirm(orderId: string) {
    this.deleteTargetOrderId.set(orderId);
    this.deleteError.set(null);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deleteTargetOrderId.set(null);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const orderId = this.deleteTargetOrderId();
    if (!orderId) return;
    const review = this.existingReview(orderId);
    if (!review) return;

    this.deletingReview.set(true);
    this.deleteError.set(null);

    // El backend usa DELETE /review/batch con array de IDs
    this.reviewsService.deleteMany([review._id]).subscribe({
      next: () => {
        this.deletingReview.set(false);
        const map = new Map(this.reviewsByOrderId());
        map.delete(orderId);
        this.reviewsByOrderId.set(map);
        this.closeDeleteConfirm();
      },
      error: (err) => {
        this.deletingReview.set(false);
        this.deleteError.set(err.error?.message || 'Error al eliminar la reseña.');
      }
    });
  }

  // ── Selección masiva ───────────────────────────────────────────────────────

  selectedCount(): number {
    return this.selectedReviewIds().size;
  }

  enterSelectionMode() {
    this.selectionMode.set(true);
    this.selectedReviewIds.set(new Set());
  }

  exitSelectionMode() {
    this.selectionMode.set(false);
    this.selectedReviewIds.set(new Set());
  }

  toggleReviewSelection(reviewId: string) {
    const set = new Set(this.selectedReviewIds());
    if (set.has(reviewId)) {
      set.delete(reviewId);
    } else {
      set.add(reviewId);
    }
    this.selectedReviewIds.set(set);
  }

  isReviewSelected(reviewId: string): boolean {
    return this.selectedReviewIds().has(reviewId);
  }

  openBatchDeleteConfirm() {
    this.batchDeleteError.set(null);
    this.showBatchDeleteConfirm.set(true);
  }

  closeBatchDeleteConfirm() {
    this.showBatchDeleteConfirm.set(false);
    this.batchDeleteError.set(null);
  }

  confirmBatchDelete() {
    const ids = Array.from(this.selectedReviewIds());
    if (ids.length === 0) return;

    this.deletingBatch.set(true);
    this.batchDeleteError.set(null);

    this.reviewsService.deleteMany(ids).subscribe({
      next: () => {
        this.deletingBatch.set(false);
        const map = new Map(this.reviewsByOrderId());
        for (const [orderId, review] of map.entries()) {
          if (ids.includes(review._id)) {
            map.delete(orderId);
          }
        }
        this.reviewsByOrderId.set(map);
        this.exitSelectionMode();
        this.closeBatchDeleteConfirm();
      },
      error: (err) => {
        this.deletingBatch.set(false);
        this.batchDeleteError.set(err.error?.message || 'Error al eliminar las reseñas.');
      }
    });
  }
}

