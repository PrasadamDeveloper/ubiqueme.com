import type { Timestamp } from 'firebase/firestore'

export interface ICanceledByAdmin {
  name: string
  uid: string
  reason: string
  canceledAt: Timestamp
}

export interface ISubscription {
  id: string // Document ID within users/{uid}/subscriptions
  userId: string // The owner of the subscription
  planType: 'bronce' | 'plata' | 'oro' | 'trial'
  status: 'active' | 'inactive' | 'canceled' // TODO: El status 'inactive' está definido pero nunca se asigna en el código actual. Se asigna solo 'active' o 'canceled'. Evaluar si se necesita una validación/ worker que actualice a 'inactive' cuando endDate haya expirado.
  purchasedAt: Timestamp
  endDate: Timestamp | null
  paymentProviderId: string
  cancelReason?: string
  canceledByAdmin?: ICanceledByAdmin
  totalQRsAllowed: number // QRs permitidos según el plan
  totalQRsCreated: number // Contador de QRs creados bajo esta suscripción
  freeShipmentsAllowed: number // Siempre 1 por plan (un envío gratuito incluido)
  freeShipmentsUsed: number // Cuántos envíos gratuitos se han consumido (0 o 1)
  // Los envíos adicionales tienen costo de $199 MXN c/u
}
