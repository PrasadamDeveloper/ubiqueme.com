import type { Timestamp } from 'firebase/firestore'

/**
 * Interface representing the properties required for the QR Card component.
 * Used for displaying summary statistics and management options for a single QR.
 *
 * @example
 * const qrCardProps: IQRCard = {
 *   name: 'MacBook Air',
 *   isActive: true,
 *   isBanned: false,
 *   banReason: '',
 *   status: 'Active',
 *   scans: 15,
 *   lastScan: 'Apr 20',
 *   id: 'QR_ABC123',
 *   createdAt: Timestamp.now(),
 *   docId: 'firestore_path_xyz'
 * }
 */
export type TQRStatus = 'Active' | 'Canceled' | 'Process' | 'Error' | 'Paused' | 'Inactive'

export interface IQRCard {
  /** Display name given to the asset by the owner */
  name: string
  /** Category of the asset (vehicle, home, phone, etc.) */
  category: string
  /** Operational state of the QR code */
  isActive: boolean
  /** Security flag indicating if the QR has been blocked by system administrators */
  isBanned: boolean
  /** Descriptive reason if the QR is currently banned */
  banReason: string
  /** Current status code for visual indicators */
  status: TQRStatus
  /** Total number of successful scans recorded */
  scans: number
  /** Formatted string representing the time of the last scan */
  lastScan: string | Timestamp | null
  /** Publicly shareable unique identifier */
  id: string
  /** Firestore timestamp of when the QR was first registered */
  createdAt: Timestamp
  /** Internal Firestore document ID for direct reference */
  docId: string
  /** Optional URL to a preview image of the asset */
  img?: string
  /** The ID of the subscription this QR code belongs to */
  subscriptionId: string
  /** Associated URL link of the QR */
  link?: string
  /** Whether the physical QR has been shipped */
  physicalShipped?: boolean
  /** Timestamp of when the physical QR was shipped */
  physicalShippedAt?: Timestamp | string
  /** Internal notes about the shipment */
  shippingNotes?: string
  /** Whether the free shipment from the plan was used */
  freeShipmentUsed?: boolean
  /** Plan type of the subscription this QR belongs to */
  planType?: 'bronce' | 'plata' | 'oro' | 'trial'
  /** Status of the parent subscription (e.g. 'active', 'canceled', 'inactive') */
  subscriptionStatus?: string
}
