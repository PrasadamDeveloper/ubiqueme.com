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
  /** Role of the user within the system */
  role: 'scanner' | 'admin' | 'user'
  /** Indicates if the account is active */
  isActive: boolean
  /** Ban status */
  isBanned: boolean
  /** Reason for ban */
  banReason: string
  /** Total amount of QR codes created globally by the user */
  totalQRs: number
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
  /** Indica si el usuario se encuentra en periodo de prueba */
  trialActive: boolean
  /** Fecha y hora en la que inicia el periodo de prueba */
  trialStartsAt: Timestamp
  /** Fecha y hora en la que expira el periodo de prueba */
  trialEndsAt: Timestamp
  /** Indica si el usuario ya ha utilizado su periodo de prueba */
  isTrialUsed: boolean
}
