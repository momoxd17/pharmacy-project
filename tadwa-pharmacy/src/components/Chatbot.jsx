import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Mail } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { apiPost } from '../utils/api'

const botResponses = {
  ar: {
    greeting: 'مرحباً! أنا مساعدك الافتراضي في طب ودواء. كيف يمكنني مساعدتك اليوم؟',
    default: 'تم إرسال سؤالك إلينا. سنرد عليك خلال 24 ساعة كحد أقصى. شكراً لثقتك بنا!',
    
    // Delivery & Orders
    delivery: 'التوصيل يستغرق 1-3 أيام عمل داخل الرياض، و3-5 أيام للمناطق الأخرى في المملكة. جميع طلباتنا مؤمنة ومغلفة بعناية.',
    deliveryFree: 'التوصيل مجاني للطلبات التي تزيد عن 100 ريال سعودي. الطلبات الأقل تخضع لرسوم توصيل 15 ريال فقط.',
    tracking: 'يمكنك تتبع طلبك بالتواصل معنا عبر الواتساب أو الاتصال على 0569177838. قريباً سنوفر خاصية التتبع المباشر.',
    cancel: 'يمكنك إلغاء أو تعديل طلبك خلال ساعة واحدة من تقديمه. تواصل معنا فوراً على 0569177838.',
    areas: 'نوصل لجميع مناطق المملكة العربية السعودية: الرياض، جدة، الدمام، مكة، المدينة، وجميع المدن الأخرى.',
    
    // Payment
    payment: 'نوفر طريقتين للدفع: (1) الدفع عند الاستلام نقداً أو بالبطاقة (2) الدفع الإلكتروني ببطاقة الائتمان/الخصم مع تشفير كامل للبيانات.',
    secure: 'نعم، جميع معاملاتنا آمنة ومشفرة بتقنية SSL. نحن نتبع أعلى معايير الأمان العالمية لحماية بياناتك المالية.',
    
    // Products
    products: 'لدينا أكثر من 5000 منتج في أقسام: الأدوية، العناية الشخصية، فيتامينات، مكملات، عناية بالبشرة، صحة الأم والطفل، والمزيد!',
    original: 'جميع منتجاتنا 100% أصلية ومرخصة من هيئة الغذاء والدواء السعودية. نضمن لك الجودة والأمان.',
    search: 'يمكنك البحث عن المنتجات بطرق متعددة: كتابة اسم المنتج، البحث الصوتي، أو حتى تصوير المنتج للبحث عن بدائل مشابهة!',
    prescription: 'بعض الأدوية تحتاج وصفة طبية. يمكنك رفع صورة الوصفة عند الطلب، وسنتواصل معك لتأكيد الطلب.',
    expired: 'نحن نراقب تواريخ الانتهاء بدقة. جميع منتجاتنا طازجة وصالحة للاستخدام لمدة لا تقل عن 6 أشهر.',
    damaged: 'إذا وصلك منتج تالف أو خاطئ، تواصل معنا خلال 24 ساعة وسنستبدله فوراً أو نسترجع قيمته كاملاً.',
    
    // Health & Advice
    vitamins: 'نوفر مجموعة واسعة من الفيتامينات والمكملات الغذائية: فيتامين د، أوميغا 3، الكالسيوم، الحديد، الزنك، وغيرها. اختر ما يناسب احتياجاتك!',
    coldFlu: 'لعلاج الزكام والإنفلونزا، نوصي بـ: الباراسيتامول للحرارة، مضادات الاحتقان، فيتامين C، والراحة والسوائل الكثيرة. يمكنك تصفح قسم الأدوية لدينا.',
    headache: 'للصداع، يمكن استخدام: الباراسيتامول، الإيبوبروفين، أو الأسبرين (حسب الحالة). تصفح قسم المسكنات لدينا أو اطلب استشارة طبية مجانية.',
    skincare: 'نوفر منتجات عناية بالبشرة من أفضل العلامات: واقيات شمس، مرطبات، علاجات حب الشباب، كريمات مضادة للشيخوخة، وغيرها!',
    diabetes: 'لدينا قسم كامل لمرضى السكري: أجهزة قياس السكر، شرائط الفحص، أدوية السكري، والمكملات المناسبة. تصفح قسم الصحة المزمنة.',
    babycare: 'قسم الأم والطفل يحتوي على: حليب الأطفال، حفاضات، مناديل، منتجات العناية، فيتامينات للأطفال، وكل ما تحتاجه الأم والطفل!',
    
    // Account
    account: 'إنشاء حساب سهل! اضغط على "إنشاء حساب" في الأعلى، أدخل اسمك وبريدك وكلمة مرور، وستتمكن من تتبع طلباتك وحفظ المفضلات.',
    password: 'إذا نسيت كلمة المرور، تواصل معنا عبر البريد الإلكتروني zeedanpharama@gmail.com أو الهاتف وسنساعدك في استعادة حسابك.',
    
    // Contact & Hours
    contact: 'يمكنك التواصل معنا عبر: الهاتف 0569177838، البريد الإلكتروني zeedanpharama@gmail.com، أو الواتساب. نحن هنا لخدمتك!',
    hours: 'نحن متاحون على مدار الساعة (24/7) عبر الموقع. خدمة العملاء متاحة من السبت إلى الخميس 9 صباحاً - 10 مساءً.',
    
    // Thanks & Goodbye
    thanks: 'على الرحب والسعة! سعيد بمساعدتك. إذا كان لديك أي سؤال آخر، أنا هنا دائماً!',
    bye: 'مع السلامة! نتمنى لك صحة وعافية. نحن هنا متى احتجتنا!',
  },
  en: {
    greeting: 'Hello! I\'m your virtual assistant at Tadwa Pharmacy. How can I help you today?',
    default: 'Your question has been sent to us. We will reply within 24 hours at most. Thank you for your trust!',
    
    // Delivery & Orders
    delivery: 'Delivery takes 1-3 business days within Riyadh and 3-5 days for other regions in the Kingdom. All orders are insured and carefully packaged.',
    deliveryFree: 'Free delivery for orders over 100 SAR. Orders below that have a delivery fee of only 15 SAR.',
    tracking: 'You can track your order by contacting us via WhatsApp or calling 0569177838. We will soon provide direct tracking feature.',
    cancel: 'You can cancel or modify your order within one hour of placing it. Contact us immediately at 0569177838.',
    areas: 'We deliver to all regions of Saudi Arabia: Riyadh, Jeddah, Dammam, Makkah, Madinah, and all other cities.',
    
    // Payment
    payment: 'We offer two payment methods: (1) Cash on delivery or card at delivery (2) Online payment by credit/debit card with full data encryption.',
    secure: 'Yes, all our transactions are secure and encrypted with SSL technology. We follow the highest international security standards to protect your financial data.',
    
    // Products
    products: 'We have over 5000 products in categories: medicines, personal care, vitamins, supplements, skincare, mother & baby care, and more!',
    original: 'All our products are 100% original and licensed by the Saudi Food and Drug Authority. We guarantee quality and safety.',
    search: 'You can search for products in multiple ways: type product name, voice search, or even take a photo of the product to search for similar alternatives!',
    prescription: 'Some medicines require a prescription. You can upload a photo of the prescription when ordering, and we will contact you to confirm.',
    expired: 'We monitor expiration dates carefully. All our products are fresh and valid for at least 6 months.',
    damaged: 'If you receive a damaged or wrong product, contact us within 24 hours and we will replace it immediately or refund you fully.',
    
    // Health & Advice
    vitamins: 'We offer a wide range of vitamins and supplements: vitamin D, omega 3, calcium, iron, zinc, and more. Choose what suits your needs!',
    coldFlu: 'For cold and flu treatment, we recommend: paracetamol for fever, decongestants, vitamin C, rest and plenty of fluids. Browse our medicines section.',
    headache: 'For headaches, you can use: paracetamol, ibuprofen, or aspirin (depending on the case). Browse our painkillers section or request free medical advice.',
    skincare: 'We offer skincare products from the best brands: sunscreens, moisturizers, acne treatments, anti-aging creams, and more!',
    diabetes: 'We have a complete section for diabetics: glucose meters, test strips, diabetes medications, and suitable supplements. Browse our chronic health section.',
    babycare: 'Mother & baby section includes: baby formula, diapers, wipes, care products, children\'s vitamins, and everything mother and baby need!',
    
    // Account
    account: 'Creating an account is easy! Click "Register" at the top, enter your name, email and password, and you can track orders and save favorites.',
    password: 'If you forgot your password, contact us via email zeedanpharama@gmail.com or phone and we will help you recover your account.',
    
    // Contact & Hours
    contact: 'You can reach us via: phone 0569177838, email zeedanpharama@gmail.com, or WhatsApp. We are here to serve you!',
    hours: 'We are available 24/7 via the website. Customer service is available Saturday to Thursday 9 AM - 10 PM.',
    
    // Thanks & Goodbye
    thanks: 'You\'re welcome! Happy to help. If you have any other questions, I\'m always here!',
    bye: 'Goodbye! We wish you health and wellness. We are here whenever you need us!',
  },
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState('chat')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const messagesEndRef = useRef(null)
  const { t, locale } = useLanguage()

  const responses = botResponses[locale]

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ from: 'bot', text: responses.greeting, time: new Date() }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getResponse = (userInput) => {
    const lower = userInput.toLowerCase()

    const keywords = {
      delivery: ['توصيل', 'شحن', 'delivery', 'shipping', 'متى يصل', 'كم يستغرق', 'how long'],
      deliveryFree: ['مجاني', 'مجانا', 'free delivery', 'رسوم', 'fees', 'كم سعر التوصيل', 'delivery fee'],
      tracking: ['تتبع', 'اين طلبي', 'track', 'where is my order', 'وين الطلب'],
      cancel: ['الغاء', 'إلغاء', 'تعديل', 'cancel', 'modify', 'change order'],
      areas: ['مناطق', 'محافظات', 'مدن', 'regions', 'cities', 'areas', 'توصلون', 'do you deliver'],
      payment: ['دفع', 'طريقة دفع', 'payment', 'pay', 'كيف ادفع', 'how to pay'],
      secure: ['آمن', 'امان', 'secure', 'safe', 'safety', 'بياناتي', 'my data'],
      products: ['منتج', 'منتجات', 'أقسام', 'product', 'products', 'categories', 'عندكم ايش', 'what do you have'],
      original: ['أصلي', 'اصلي', 'مرخص', 'original', 'licensed', 'authentic', 'مضمون'],
      search: ['بحث', 'ابحث', 'كيف ابحث', 'search', 'find', 'how to search'],
      prescription: ['وصفة', 'روشتة', 'prescription', 'روشته'],
      expired: ['منتهي', 'صلاحية', 'expired', 'expiry', 'تاريخ'],
      damaged: ['تالف', 'مكسور', 'خطأ', 'damaged', 'broken', 'wrong'],
      vitamins: ['فيتامين', 'مكمل', 'vitamin', 'supplement', 'اوميجا', 'omega', 'كالسيوم', 'calcium'],
      coldFlu: ['زكام', 'انفلونزا', 'برد', 'cold', 'flu', 'احتقان', 'congestion'],
      headache: ['صداع', 'راس', 'headache', 'مسكن', 'painkiller'],
      skincare: ['بشرة', 'جلد', 'كريم', 'skin', 'cream', 'حب الشباب', 'acne'],
      diabetes: ['سكر', 'سكري', 'diabetes', 'جهاز سكر', 'glucose'],
      babycare: ['طفل', 'رضيع', 'حفاظ', 'baby', 'infant', 'diaper', 'حليب', 'formula'],
      account: ['حساب', 'تسجيل', 'account', 'register', 'sign up', 'انشاء حساب'],
      password: ['نسيت', 'كلمة مرور', 'password', 'forgot', 'استرجاع'],
      contact: ['تواصل', 'رقم', 'ايميل', 'contact', 'phone', 'email', 'واتساب', 'whatsapp'],
      hours: ['ساعات', 'مواعيد', 'متى مفتوح', 'hours', 'open', 'working hours'],
      thanks: ['شكرا', 'شكراً', 'thanks', 'thank you', 'يعطيك العافية'],
      bye: ['وداعا', 'وداعاً', 'باي', 'bye', 'goodbye', 'مع السلامة'],
    }

    for (const [key, terms] of Object.entries(keywords)) {
      if (terms.some((term) => lower.includes(term))) {
        return responses[key] || responses.default
      }
    }

    return responses.default
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { from: 'user', text: input, time: new Date() }
    const userInput = input
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    const response = getResponse(userInput)
    if (response === responses.default) {
      apiPost('/chatbot-questions', { question: userInput }).catch((err) => {
        console.warn('Could not save chatbot question (is server running?):', err?.message)
      })
    }
    const botMsg = { from: 'bot', text: response, time: new Date() }
    setMessages((prev) => [...prev, botMsg])
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    if (!feedbackEmail.trim() || !feedbackMessage.trim()) return
    setFeedbackSending(true)
    setFeedbackError('')
    try {
      await apiPost('/feedback', { email: feedbackEmail.trim(), message: feedbackMessage.trim() })
      setFeedbackSent(true)
      setFeedbackEmail('')
      setFeedbackMessage('')
    } catch (err) {
      setFeedbackSent(false)
      setFeedbackError(err?.message === 'NETWORK_ERROR' ? t('serverUnavailable') : (t('serverUnavailable') + ' ' + (err?.message || '')))
    } finally {
      setFeedbackSending(false)
    }
  }

  const switchToChat = () => {
    setMode('chat')
    setFeedbackSent(false)
  }

  const switchToFeedback = () => {
    setMode('feedback')
  }

  return (
    <>
      {/* Chatbot button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center z-50"
          title={t('chatWithUs')}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chatbot window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-l from-[#004180] to-[#1B98E0] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">{t('chatbot')}</h3>
                <p className="text-xs text-white/90">{t('onlineNow')}</p>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); setMode('chat') }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={switchToChat}
              className={`flex-1 py-2 text-sm font-medium ${mode === 'chat' ? 'border-b-2 border-[#1B98E0] text-[#1B98E0]' : 'text-gray-500'}`}
            >
              {t('chatWithUs')}
            </button>
            <button
              onClick={switchToFeedback}
              className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1 ${mode === 'feedback' ? 'border-b-2 border-[#1B98E0] text-[#1B98E0]' : 'text-gray-500'}`}
            >
              <Mail className="w-4 h-4" />
              {t('feedbackContact')}
            </button>
          </div>

          {/* Chat mode */}
          {mode === 'chat' && (
          <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.from === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B98E0] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          </>
          )}

          {/* Feedback mode */}
          {mode === 'feedback' && (
            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">{t('feedbackContactDesc')}</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                  <input
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B98E0]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourMessage')}</label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={t('feedbackPlaceholder')}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1B98E0] resize-none"
                  />
                </div>
                {feedbackSent && (
                  <p className="text-sm text-green-600">{t('feedbackSent')}</p>
                )}
                {feedbackError && (
                  <p className="text-sm text-red-600">{feedbackError}</p>
                )}
                <button
                  type="submit"
                  disabled={feedbackSending}
                  className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {feedbackSending ? t('loading') : t('send')}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  )
}
