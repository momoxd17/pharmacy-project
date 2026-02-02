import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { CreditCard, Banknote, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { luhnCheck, validateExpiry, validateCVV } from '../utils/cardValidation'

export default function Payment() {
  const location = useLocation()
  const { clearCart } = useCart()
  const { t } = useLanguage()
  const state = location.state
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderComplete, setOrderComplete] = useState(false)
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  })
  const [cardErrors, setCardErrors] = useState({})
  const [cardTouched, setCardTouched] = useState(false)

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 19)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2)
    }
    return digits
  }

  const validateCard = () => {
    const e = {}
    const digits = cardForm.cardNumber.replace(/\D/g, '')
    if (digits.length < 13) {
      e.cardNumber = t('errCardNumber')
    } else if (!luhnCheck(cardForm.cardNumber)) {
      e.cardNumber = t('errCardNumber')
    }
    if (!validateExpiry(cardForm.expiry)) {
      e.expiry = t('errExpiry')
    }
    if (!validateCVV(cardForm.cvv)) {
      e.cvv = t('errCvv')
    }
    if (!cardForm.cardholderName.trim()) {
      e.cardholderName = t('errCardholder')
    }
    setCardErrors(e)
    return Object.keys(e).length === 0
  }

  if (!state?.order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('orderNotFound')}</h2>
        <Link to="/cart" className="text-teal-600 hover:underline">
          {t('backToCart')}
        </Link>
      </div>
    )
  }

  const { order } = state

  const handleConfirm = () => {
    if (paymentMethod === 'card') {
      setCardTouched(true)
      if (!validateCard()) return
    }
    clearCart()
    setOrderComplete(true)
  }

  if (orderComplete) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('orderSuccess')}</h1>
        <p className="text-gray-600 mb-6">
          {t('orderSuccessDesc')} {order.shipping.phone}
        </p>
        <Link
          to="/"
          className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
        >
          {t('backToShop')}
        </Link>
      </div>
    )
  }

  const showCardErrors = paymentMethod === 'card' && cardTouched

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">{t('payment')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">{t('paymentMethod')}</h2>
          <div className="space-y-3">
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                paymentMethod === 'cod' ? 'border-teal-600 bg-teal-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="hidden"
              />
              <Banknote className="w-8 h-8 text-teal-600" />
              <div>
                <p className="font-medium text-gray-800">{t('payOnDeliveryOption')}</p>
                <p className="text-sm text-gray-500">{t('payOnDeliveryDesc2')}</p>
              </div>
            </label>
            <label
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-teal-600 bg-teal-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                className="hidden"
              />
              <CreditCard className="w-8 h-8 text-teal-600" />
              <div>
                <p className="font-medium text-gray-800">{t('payByCard')}</p>
                <p className="text-sm text-gray-500">{t('payByCardDesc')}</p>
              </div>
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="mt-6 p-4 border border-gray-200 rounded-xl space-y-4 bg-white">
              <h3 className="font-medium text-gray-800">{t('cardDetails')}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardNumber')}</label>
                <input
                  type="text"
                  value={cardForm.cardNumber}
                  onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder={t('cardNumberPlaceholder')}
                  className={`w-full px-4 py-3 border rounded-lg font-mono ${
                    showCardErrors && cardErrors.cardNumber ? 'border-red-500' : 'border-gray-200'
                  }`}
                  dir="ltr"
                  maxLength={19}
                />
                {showCardErrors && cardErrors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{cardErrors.cardNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('expiry')}</label>
                  <input
                    type="text"
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                    placeholder={t('expiryPlaceholder')}
                    className={`w-full px-4 py-3 border rounded-lg font-mono ${
                      showCardErrors && cardErrors.expiry ? 'border-red-500' : 'border-gray-200'
                    }`}
                    dir="ltr"
                    maxLength={5}
                  />
                  {showCardErrors && cardErrors.expiry && (
                    <p className="text-red-500 text-sm mt-1">{cardErrors.expiry}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    className={`w-full px-4 py-3 border rounded-lg font-mono ${
                      showCardErrors && cardErrors.cvv ? 'border-red-500' : 'border-gray-200'
                    }`}
                    dir="ltr"
                    maxLength={4}
                  />
                  {showCardErrors && cardErrors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{cardErrors.cvv}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cardholderName')}</label>
                <input
                  type="text"
                  value={cardForm.cardholderName}
                  onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                  placeholder={t('cardholderPlaceholder')}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    showCardErrors && cardErrors.cardholderName ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {showCardErrors && cardErrors.cardholderName && (
                  <p className="text-red-500 text-sm mt-1">{cardErrors.cardholderName}</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-2">{t('shippingAddress')}</h3>
            <p>{order.shipping.name}</p>
            <p>{order.shipping.phone}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}</p>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-800 mb-4">{t('orderSummary')}</h2>
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {order.items.map((item) => (
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
              <span className="text-teal-600">{order.total} {t('sar')}</span>
            </div>
            <button
              onClick={handleConfirm}
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-medium"
            >
              {t('confirmOrder')}
            </button>
            <Link
              to="/checkout"
              className="block text-center text-teal-600 mt-3 text-sm hover:underline"
            >
              {t('editShipping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
