import type { Timestamp } from 'firebase/firestore'

/**
 * Interface representing a user's QR code asset in the dashboard.
 * Used for managing the state and display of individual QR registrations.
 *
 * @example
 * const myQr: IMyQR = {
 *   id: 'ABC123',
 *   name: 'Office Keys',
 *   isActive: true,
 *   isBanned: false,
 *   banReason: '',
 *   status: 'Active',
 *   scans: 5,
 *   lastScan: '2024-04-21',
 *   createdAt: Timestamp.now(),
 *   docId: 'firestore_doc_id_123'
 * }
 */
export type TQRStatus = 'Active' | 'Canceled' | 'Process' | 'Error' | 'Paused'

export interface IMyQR {
  id: string
  docId: string
  name: string
  isActive: boolean
  isBanned: boolean
  banReason: string
  status: TQRStatus
  scans: number
  lastScan: string
  createdAt: Timestamp
  subscriptionId: string
  link?: string
}
