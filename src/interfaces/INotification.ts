/**
 * Interface representing an application notification or alert.
 * Manages system-wide communication to the user regarding scans, billing, or updates.
 *
 * @example
 * const scanAlert: INotification = {
 *   id: 101,
 *   type: 'qr_scan',
 *   title: 'QR Code Scanned',
 *   message: 'Your item "Backpack" was just scanned by someone.',
 *   date: '2 minutes ago',
 *   read: false
 * }
 */
export interface INotification {
  /** Unique numerical identifier for the notification */
  id: number
  /** Categorization for dynamic icon and color rendering */
  type: 'qr_scan' | 'system' | 'billing'
  /** Concise headline for the notification */
  title: string
  /** Detailed body text explaining the event or required action */
  message: string
  /** Human-readable or timestamp-derived date string */
  date: string
  /** Boolean state tracking if the user has viewed the notification */
  read: boolean
}
