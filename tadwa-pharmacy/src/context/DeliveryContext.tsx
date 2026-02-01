import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useLanguage } from './LanguageContext'

const STORAGE_KEY = 'tadwa_delivery_region'

export interface DeliveryRegion {
  id: string
  ar: string
  en: string
}

const SAUDI_REGIONS: DeliveryRegion[] = [
  { id: 'riyadh', ar: 'الرياض', en: 'Riyadh' },
  { id: 'makkah', ar: 'مكة المكرمة', en: 'Makkah' },
  { id: 'madinah', ar: 'المدينة المنورة', en: 'Madinah' },
  { id: 'eastern', ar: 'المنطقة الشرقية', en: 'Eastern Province' },
  { id: 'qassim', ar: 'القصيم', en: 'Qassim' },
  { id: 'asir', ar: 'عسير', en: 'Asir' },
  { id: 'tabuk', ar: 'تبوك', en: 'Tabuk' },
  { id: 'hail', ar: 'حائل', en: "Ha'il" },
  { id: 'northern', ar: 'الحدود الشمالية', en: 'Northern Borders' },
  { id: 'jazan', ar: 'جازان', en: 'Jazan' },
  { id: 'najran', ar: 'نجران', en: 'Najran' },
  { id: 'albaha', ar: 'الباحة', en: 'Al Baha' },
  { id: 'aljouf', ar: 'الجوف', en: 'Al Jouf' },
]

interface DeliveryContextType {
  deliveryRegionId: string
  deliveryRegionName: string
  setDeliveryRegion: (regionId: string) => void
  regions: DeliveryRegion[]
}

const DeliveryContext = createContext<DeliveryContextType | null>(null)

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage()
  const [regionId, setRegionIdState] = useState(() => {
    try {
      if (typeof localStorage === 'undefined') return 'riyadh'
      return localStorage.getItem(STORAGE_KEY) || 'riyadh'
    } catch {
      return 'riyadh'
    }
  })

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, regionId)
    } catch {}
  }, [regionId])

  const region = SAUDI_REGIONS.find((r) => r.id === regionId) ?? SAUDI_REGIONS[0]
  const deliveryRegionName = locale === 'ar' ? region.ar : region.en

  const setDeliveryRegion = (id: string) => {
    if (SAUDI_REGIONS.some((r) => r.id === id)) setRegionIdState(id)
  }

  return (
    <DeliveryContext.Provider
      value={{
        deliveryRegionId: regionId,
        deliveryRegionName,
        setDeliveryRegion,
        regions: SAUDI_REGIONS,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  )
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext)
  if (!ctx) throw new Error('useDelivery must be used within DeliveryProvider')
  return ctx
}
