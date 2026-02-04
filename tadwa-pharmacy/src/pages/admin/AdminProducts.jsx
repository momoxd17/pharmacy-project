import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Upload, FileSpreadsheet } from 'lucide-react'
import { useProducts } from '../../context/ProductsContext'
import { useLanguage } from '../../context/LanguageContext'
import { apiPostFile } from '../../utils/api'

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, refetchProducts } = useProducts()
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState(null)
  const [editing, setEditing] = useState(null)
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

  const openEdit = (p) => {
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

  const handleSubmit = (e) => {
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

  const handleDelete = (id) => {
    if (confirm(t('confirmDelete'))) deleteProduct(id)
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)
    setImportError(null)
    setImportResult(null)
    try {
      const formData = new FormData()
      formData.append('file', importFile)
      const result = await apiPostFile('/products/import', formData)
      setImportResult(result)
      setImportFile(null)
      refetchProducts()
    } catch (err) {
      let msg = err.message || t('importFailed')
      if (err.message === 'NETWORK_ERROR' || err.status === 404) {
        msg = t('serverUnavailable')
      } else if (err.status === 401) {
        msg = t('pleaseLoginAgain')
      }
      setImportError(msg)
    } finally {
      setImporting(false)
    }
  }

  const closeImportModal = () => {
    setImportOpen(false)
    setImportFile(null)
    setImportError(null)
    setImportResult(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{t('manageProducts')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            {t('importProducts')}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            {t('addProduct')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-3 px-4 font-medium text-gray-700"></th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">{t('product')}</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">{t('price')}</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">{t('category')}</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700"></th>
                <th className="text-right py-3 px-4 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800">{p.nameAr}</td>
                  <td className="py-3 px-4 text-[#004180]">{p.price} {t('sar')}</td>
                  <td className="py-3 px-4 text-gray-600">{p.categoryAr}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.inStock ? t('available') : t('unavailable')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title={t('edit')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title={t('delete')}
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
          <p className="text-center text-gray-500 py-12">{t('noProducts')}</p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editing ? t('editProduct') : t('addNewProduct')}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameAr')}</label>
                <input
                  type="text"
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameEn')}</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('price')} ({t('sar')})</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('originalPrice')} ({t('optional')})</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('mainImage')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('extraImages')}</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')} ({t('optional')})</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('ingredients')} ({t('optional')})</label>
                <input
                  type="text"
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('usageInstructions')} ({t('optional')})</label>
                <input
                  type="text"
                  value={form.usageInstructions}
                  onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('storageConditions')} ({t('optional')})</label>
                <input
                  type="text"
                  value={form.storageConditions}
                  onChange={(e) => setForm({ ...form, storageConditions: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('warnings')} ({t('optional')})</label>
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
                <span className="text-sm text-gray-700">{t('available')}</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
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

      {importOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                {t('importProducts')}
              </h2>
              <button onClick={closeImportModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">{t('importProductsHelp')}</p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-xs text-gray-600 font-mono">
                {t('importRequiredFields')}
              </div>
              <p className="text-gray-700 mb-4 text-xs">
                <a href="/products-import-template.csv" download className="text-[#0066CC] font-medium hover:text-[#004494] hover:underline underline-offset-2">{t('downloadTemplate')}</a>
              </p>
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">{t('selectFile')}</span>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1B98E0] hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={importing}
                    />
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700 text-sm font-medium">
                      {importFile ? importFile.name : t('clickToSelectFile')}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">.xlsx, .xls, .csv</p>
                  </label>
                </div>
                {importError && (
                  <p className="text-red-600 text-sm">{importError}</p>
                )}
                {importResult && (
                  <p className="text-green-600 text-sm">{importResult.message}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!importFile || importing}
                    className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? t('loading') : t('import')}
                  </button>
                  <button
                    type="button"
                    onClick={closeImportModal}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
