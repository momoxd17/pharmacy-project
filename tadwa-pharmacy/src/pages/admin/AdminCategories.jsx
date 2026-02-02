import { useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useLanguage } from '../../context/LanguageContext'

export default function AdminCategories() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useProducts()
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nameAr: '', name: '', icon: '📦' })

  const resetForm = () => {
    setForm({ nameAr: '', name: '', icon: '📦' })
    setEditing(null)
    setModalOpen(false)
  }

  const openAdd = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ nameAr: c.nameAr, name: c.name, icon: c.icon })
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editing) {
      updateCategory(editing.slug, {
        nameAr: form.nameAr,
        name: form.name || form.nameAr,
        icon: form.icon,
      })
    } else {
      addCategory({
        nameAr: form.nameAr,
        name: form.name || form.nameAr,
        icon: form.icon,
      })
    }
    resetForm()
  }

  const handleDelete = (slug) => {
    const count = products.filter((p) => p.category === slug).length
    if (count > 0 && !confirm(`${t('categoryHasProducts')} ${count} ${t('productsWillBeDeleted')}`)) return
    else if (count === 0 && !confirm(t('confirmDeleteCategory'))) return
    deleteCategory(slug)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('manageCategories')}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          {t('addCategory')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.slug}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{c.nameAr}</p>
                <p className="text-sm text-gray-500">
                  {products.filter((p) => p.category === c.slug).length} {t('product')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(c)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                title={t('edit')}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c.slug)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                title={t('delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-gray-500 py-12 bg-white rounded-xl">{t('noCategories')}</p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? t('editCategory') : t('addNewCategory')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoryName')}</label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('emoji')}</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-2xl text-center"
                  maxLength={4}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {editing ? t('saveChanges') : t('add')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
