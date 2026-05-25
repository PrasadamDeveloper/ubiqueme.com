import type { Timestamp } from 'firebase/firestore';

export interface ISubscription {
  id: string; // Document ID within users/{uid}/subscriptions
  userId: string; // The owner of the subscription
  planType: 'alpha' | 'beta' | 'epsilon' | 'trial';
  status: 'active' | 'inactive' | 'canceled';
  purchasedAt: Timestamp;
  endDate: Timestamp | null;
  paymentProviderId: string;
  cancelReason?: string;
  totalQRsAllowed: number; // Based on the plan type
  totalQRsCreated: number; // Counter for QRs created under this subscription
}
