import type { Timestamp } from 'firebase/firestore'

export interface IUser {
  /** UID único provisto por Firebase Auth que corresponde al ID del documento en /users */
  uid: string
  /** Nombre completo del usuario / cliente */
  name: string
  /** Correo electrónico registrado */
  email: string
  /** Teléfono de contacto (opcional) */
  phone: string
  /** Rol del usuario dentro del sistema */
  role: 'scanner' | 'admin' | 'user'
  /** Indica si la cuenta se encuentra activa en el flujo del sistema */
  isActive: boolean
  /** Estado de bloqueo/suspensión por administración */
  isBanned: boolean
  /** Razón descriptiva detallada si la cuenta fue suspendida */
  banReason: string
  /** Plan actual de suscripción del usuario */
  plan: 'alpha' | 'beta' | 'epsilon'
  /** Estado comercial de la suscripción */
  subscriptionStatus: 'active' | 'inactive' | 'canceled'
  /** Fecha en la que se adquirió el plan actual */
  planPurchasedAt: Timestamp
  /** Fecha en la que expira el plan (null para pruebas o planes sin fecha fija) */
  planEndDate: Timestamp
  /** ID de referencia del proveedor de pagos (por ejemplo, Stripe o PayPal) */
  paymentProviderId: string
  /** Cantidad acumulada de códigos QR creados por el usuario */
  totalQRs: number
  planCancelReason: string
  /** Preferencias de comunicación y notificaciones del usuario */
  preferences: {
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
  }
  /** Fecha y hora del último inicio de sesión */
  lastLoginAt: Timestamp
  /** Fecha y hora en la que se registró la cuenta */
  createdAt: Timestamp
}
