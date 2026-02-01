import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import type { Product } from '../../data/products'

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    price: 0,
    originalPrice: '',
    image: '',
    imagesExtra: '',
    category: '',
    description: '',
    ingredients: '',
    usageInstructions: '',
    storageConditions: '',
    warnings: '',
    inStock: true,
  })

  const resetForm = () => {
    setForm({
      name: '',
      nameAr: '',
      price: 0,
      originalPrice: '',
      image: '',
      imagesExtra: '',
      category: categories[0]?.slug ?? '',
      description: '',
      ingredients: '',
      usageInstructions: '',
      storageConditions: '',
      warnings: '',
      inStock: true,
    })
    setEditing(null)
    setModalOpen(false)
  }

  const openAdd = () => {
    resetForm()
    setForm((f) => ({ ...f, category: categories[0]?.slug ?? '' }))
    setModalOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      nameAr: p.nameAr,
      price: p.price,
      originalPrice: p.originalPrice?.toString() ?? '',
      image: p.image,
      imagesExtra: p.images?.slice(1).join('\n') ?? '',
      category: p.category,
      description: p.description ?? '',
      ingredients: p.ingredients ?? '',
      usageInstructions: p.usageInstructions ?? '',
      storageConditions: p.storageConditions ?? '',
      warnings: p.warnings ?? '',
      inStock: p.inStock,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const category = categories.find((c) => c.slug === form.category)
    if (!category) return

    const extraImages = form.imagesExtra
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const images = extraImages.length ? [form.image, ...extraImages] : undefined

    const extra = {
      name: form.name,
      nameAr: form.nameAr,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      image: form.image,
      images,
      category: form.category,
      categoryAr: category.nameAr,
      description: form.description || undefined,
      ingredients: form.ingredients || undefined,
      usageInstructions: form.usageInstructions || undefined,
      storageConditions: form.storageConditions || undefined,
      warnings: form.warnings || undefined,
      inStock: form.inStock,
    }

    if (editing) {
      updateProduct(editing.id, extra)
    } else {
      addProduct(extra)
    }
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) deleteProduct(id)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-700">الصورة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">المنتج</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">السعر</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">القسم</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{p.nameAr}</td>
                  <td className="py-3 px-4 text-teal-600">{p.price} ج.م</td>
                  <td className="py-3 px-4 text-gray-600">{p.categoryAr}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.inStock ? 'متاح' : 'غير متاح'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <p className="text-center text-gray-500 py-12">لا توجد منتجات</p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم (إنجليزي)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي (اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة الرئيسية</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صور إضافية (رابط كل صورة في سطر)</label>
                <textarea
                  value={form.imagesExtra}
                  onChange={(e) => setForm({ ...form, imagesExtra: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  dir="ltr"
                  rows={2}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المكونات (اختياري)</label>
                <input
                  type="text"
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الاستخدام (اختياري)</label>
                <input
                  type="text"
                  value={form.usageInstructions}
                  onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ظروف التخزين (اختياري)</label>
                <input
                  type="text"
                  value={form.storageConditions}
                  onChange={(e) => setForm({ ...form, storageConditions: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تحذيرات (اختياري)</label>
                <input
                  type="text"
                  value={form.warnings}
                  onChange={(e) => setForm({ ...form, warnings: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                />
                <span className="text-sm text-gray-700">متاح للتوصيل</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {editing ? 'حفظ التعديلات' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
