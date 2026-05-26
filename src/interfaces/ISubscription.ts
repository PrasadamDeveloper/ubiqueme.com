import type { Timestamp } from 'firebase/firestore';

export interface ISubscription {
  id: string;              // Document ID within users/{uid}/subscriptions
  userId: string;          // The owner of the subscription
  planType: 'bronce' | 'plata' | 'oro' | 'trial';
  status: 'active' | 'inactive' | 'canceled';
  purchasedAt: Timestamp;
  endDate: Timestamp | null;
  paymentProviderId: string;
  cancelReason?: string;
  totalQRsAllowed: number;      // QRs permitidos según el plan
  totalQRsCreated: number;      // Contador de QRs creados bajo esta suscripción
  freeShipmentsAllowed: number; // Siempre 1 por plan (un envío gratuito incluido)
  freeShipmentsUsed: number;    // Cuántos envíos gratuitos se han consumido (0 o 1)
  // Los envíos adicionales tienen costo de $199 MXN c/u
}
