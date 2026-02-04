import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'

export default function Cart() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, clearCart } = useCart()
  const { t } = useLanguage()
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('emptyCart')}</h2>
        <p className="text-gray-500 mb-6">{t('emptyCartDesc')}</p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          {t('shopNow')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('cart')}</h1>
        <button
          onClick={() => { if (confirm(t('confirmClearCart'))) clearCart() }}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {t('clearCart')}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl shadow-sm p-4 flex gap-4 border border-gray-100"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{item.name}</h3>
              <p className="text-[#004180] font-bold">{item.price} {t('sar')}</p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="mr-4 p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-left">
              <span className="font-bold text-gray-800">
                {item.price * item.quantity} {t('sar')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between text-lg font-bold">
          <span>{t('total')}</span>
          <span className="text-[#004180]">{total} {t('sar')}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-4 bg-black text-white py-3 rounded-xl hover:bg-gray-800"
        >
          {t('completeOrder')}
        </button>
      </div>
    </div>
  )
}
