import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'

export default function Checkout() {
  const navigate = useNavigate()
  const { items } = useCart()
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = t('errName')
    if (!form.phone.trim()) e.phone = t('errPhone')
    if (!form.address.trim()) e.address = t('errAddress')
    if (!form.city.trim()) e.city = t('errCity')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    navigate('/payment', {
      state: {
        order: {
          items,
          total,
          shipping: form,
        },
      },
    })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('emptyCart')}</h2>
        <Link to="/" className="text-teal-600 hover:underline">
          {t('backToShop')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{t('completeOrderTitle')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800 mb-4">{t('shippingInfo')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={t('namePlaceholder')}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="05xxxxxxxx"
              dir="ltr"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')} *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-200'}`}
              rows={2}
              placeholder={t('addressPlaceholder')}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')} *</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-200'}`}
              placeholder={t('cityPlaceholder')}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('notes')} ({t('optional')})</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg"
              rows={2}
              placeholder={t('notesPlaceholder')}
            />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">{t('orderSummary')}</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{item.price * item.quantity} {t('sar')}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>{t('total')}</span>
              <span className="text-teal-600">{total} {t('sar')}</span>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-medium"
            >
              {t('proceedToPay')}
            </button>
            <Link
              to="/cart"
              className="block text-center text-teal-600 mt-3 text-sm hover:underline"
            >
              {t('editCart')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
