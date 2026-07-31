export type CurrencyKey = 'MXN' | 'USD' | 'CLP'

export interface PlanPrice {
  price: string
  symbol: string
  label: string
  period: string
  note: string
  monthly: string
}

export interface PlanFeature {
  label: string
  included: boolean
  icon?: string
}

export interface Plan {
  id: string
  name: string
  tagline: string
  description: string
  badge: string
  recommended: boolean
  featured: boolean
  cta: string
  maxQrs: number
  prices: Record<CurrencyKey, PlanPrice>
  features: PlanFeature[]
}

const commonFeatures: PlanFeature[] = [
  { label: 'Alerta inmediata por WhatsApp al escanear su QR', included: true, icon: 'notifications_active' },
  { label: 'Su número protegido: el escáner contacta la cuenta oficial de Ubiqueme', included: true, icon: 'lock' },
  { label: 'Recibe el número, mensaje y foto de quien escanea', included: true, icon: 'contact_phone' },
  { label: 'Registro y contador de escaneos en su dashboard', included: true, icon: 'monitoring' },
  { label: 'Descarga de su QR en PNG/PDF para imprimir', included: true, icon: 'download' },
  { label: 'Reemplazar su QR cuando lo necesite', included: true, icon: 'autorenew' },
  { label: 'QR físico con primer envío gratis (México)', included: true, icon: 'local_shipping' },
]

export const plans: Plan[] = [
  {
    id: 'bronce',
    name: 'Bronce',
    tagline: 'Protección básica esencial',
    description: 'Protección básica esencial para comenzar.',
    badge: '',
    recommended: false,
    featured: false,
    cta: 'Activar Bronce',
    maxQrs: 1,
    prices: {
      MXN: { price: '499', symbol: '$', label: 'MXN', period: '/año', note: '1er envío físico gratis', monthly: '42' },
      USD: { price: '29', symbol: '$', label: 'USD', period: '/año', note: '1er envío físico gratis', monthly: '2.4' },
      CLP: { price: '25000', symbol: '$', label: 'CLP', period: '/año', note: '1er envío físico gratis', monthly: '2100' },
    },
    features: [
      { label: 'Hasta 1 código QR activo', included: true, icon: 'qr_code_2' },
      ...commonFeatures,
      { label: 'Activar su QR para escaneo público', included: false, icon: 'public' },
      { label: 'Pausar o reactivar su QR', included: false, icon: 'pause' },
    ],
  },

  {
    id: 'plata',
    name: 'Plata',
    tagline: 'Para proteger varios objetos',
    description: 'Para quienes toman en serio sus bienes.',
    badge: 'Más elegido',
    recommended: true,
    featured: true,
    cta: 'Activar Plata',
    maxQrs: 3,
    prices: {
      MXN: { price: '999', symbol: '$', label: 'MXN', period: '/año', note: '1er envío físico gratis', monthly: '83' },
      USD: { price: '59', symbol: '$', label: 'USD', period: '/año', note: '1er envío físico gratis', monthly: '4.9' },
      CLP: { price: '49000', symbol: '$', label: 'CLP', period: '/año', note: '1er envío físico gratis', monthly: '4100' },
    },
    features: [
      { label: 'Hasta 3 códigos QR activos', included: true, icon: 'qr_code_2' },
      ...commonFeatures,
      { label: 'Activar su QR para escaneo público', included: true, icon: 'public' },
      { label: 'Pausar o reactivar su QR', included: true, icon: 'pause' },
    ],
  },

  {
    id: 'oro',
    name: 'Oro',
    tagline: 'Control completo sin límites',
    description: 'Control total. Sin compromisos.',
    badge: 'Premium',
    recommended: false,
    featured: false,
    cta: 'Seleccionar Oro',
    maxQrs: 5,
    prices: {
      MXN: { price: '1499', symbol: '$', label: 'MXN', period: '/año', note: '1er envío físico gratis', monthly: '125' },
      USD: { price: '89', symbol: '$', label: 'USD', period: '/año', note: '1er envío físico gratis', monthly: '7.4' },
      CLP: { price: '75000', symbol: '$', label: 'CLP', period: '/año', note: '1er envío físico gratis', monthly: '6300' },
    },
    features: [
      { label: 'Hasta 5 códigos QR activos', included: true, icon: 'qr_code_2' },
      ...commonFeatures,
      { label: 'Activar su QR para escaneo público', included: true, icon: 'public' },
      { label: 'Pausar o reactivar su QR', included: true, icon: 'pause' },
    ],
  },
]

export const planById = (id: string | null | undefined): Plan | undefined => {
  if (!id) return undefined
  return plans.find((plan) => plan.id === id)
}
