//This contains the structure of a public QR (QR Code that can be scanned by anyone)

import type { Timestamp } from 'firebase/firestore'

export interface IPublicQR {
  id: string
  status: string
  lastScan: Timestamp | null
  totalScans: number | null
  name?: string
  category?: string
  isBanned: boolean
  banReason?: string
  docId?: string
  img?: string
  uid?: string //User uid
  tier?: string
}

export interface IQRScanMetrics {
  city: string
  country: string
  region: string
  lat?: string
  lon?: string
  postal?: string
  timezone?: string
}

export interface IQRLog {
  id: string
  scanDate: Timestamp
  scanMetrics: IQRScanMetrics
  interaction?: {
    reason: string
    message?: string
    type: string
    email?: string
    phone?: string
  }
  img?: string
}
