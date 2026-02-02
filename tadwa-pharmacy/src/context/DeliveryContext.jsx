import { createContext, useContext, useState, useEffect } from 'react'
import { useLanguage } from './LanguageContext'

const STORAGE_KEY = 'tadwa_delivery_region'

// Eastern Province only - المنطقة الشرقية
const SAUDI_REGIONS = [
  { id: 'dammam', ar: 'الدمام', en: 'Dammam' },
  { id: 'khobar', ar: 'الخبر', en: 'Khobar' },
  { id: 'dhahran', ar: 'الظهران', en: 'Dhahran' },
  { id: 'qatif', ar: 'القطيف', en: 'Qatif' },
  { id: 'alahsa', ar: 'الأحساء', en: 'Al-Ahsa' },
  { id: 'jubail', ar: 'الجبيل', en: 'Jubail' },
  { id: 'ras_tanura', ar: 'رأس تنورة', en: 'Ras Tanura' },
  { id: 'nuairiyah', ar: 'النعيرية', en: 'Nuairiyah' },
  { id: 'khafji', ar: 'الخفجي', en: 'Khafji' },
]

const DeliveryContext = createContext(null)

export function DeliveryProvider({ children }) {
  const { locale } = useLanguage()
  const [regionId, setRegionIdState] = useState(() => {
    try {
      if (typeof localStorage === 'undefined') return 'riyadh'
      return localStorage.getItem(STORAGE_KEY) || 'dammam'
    } catch {
      return 'dammam'
    }
  })

  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, regionId)
    } catch {}
  }, [regionId])

  const region = SAUDI_REGIONS.find((r) => r.id === regionId) ?? SAUDI_REGIONS[0]
  const deliveryRegionName = locale === 'ar' ? region.ar : region.en

  const setDeliveryRegion = (id) => {
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
