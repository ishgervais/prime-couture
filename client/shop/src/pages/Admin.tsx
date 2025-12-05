import { FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { productsApi } from '../lib/api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Cart from '../components/Cart'

export default function Admin() {
  const { user } = useAuth()
  const [cartOpen, setCartOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    priceAmount: '',
    priceCurrency: 'RWF',
    collectionId: '',
    categoryId: '',
    isActive: true,
  })

  const [imageForm, setImageForm] = useState({
    productId: '',
    imageUrl: '',
    altText: '',
    position: 0,
  })

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    try {
      const payload = {
        ...form,
        priceAmount: Number(form.priceAmount),
      }
      const product = await productsApi.create(payload)
      setMessage(`Product created: ${product.title}`)
      setImageForm((prev) => ({ ...prev, productId: product.id }))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create product')
    }
  }

  const handleImageSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!imageForm.productId) {
      setError('Enter a product ID first')
      return
    }
    try {
      await productsApi.addImage(imageForm.productId, {
        imageUrl: imageForm.imageUrl,
        altText: imageForm.altText,
        position: Number(imageForm.position),
      })
      setMessage('Image added to product')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add image')
    }
  }

  return (
    <div className="min-h-screen bg-white text-sm">
      <Header onCartOpen={() => setCartOpen(true)} />
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="pt-24 container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-light">Admin Workspace</h1>
          <p className="text-gray-500">
            Create products and attach images directly. Signed in user: {user ? `${user.name} (${user.role})` : 'Guest'}
          </p>
        </div>

        {!user && (
          <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg mb-6">
            Please sign in (top right) to manage products.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg font-medium mb-4">Create Product</h2>
            <form className="space-y-3" onSubmit={handleProductSubmit}>
              <div>
                <label className="block text-gray-600 mb-1">Title</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Slug</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Price Amount</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    value={form.priceAmount}
                    onChange={(e) => setForm({ ...form, priceAmount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Currency</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    value={form.priceCurrency}
                    onChange={(e) => setForm({ ...form, priceCurrency: e.target.value })}
                  >
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 mb-1">Collection ID</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    value={form.collectionId}
                    onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
                    placeholder="collection UUID"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Category ID</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    placeholder="category UUID"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="text-gray-600">Active</span>
              </div>
              <button
                type="submit"
                className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                disabled={!user}
              >
                Create product
              </button>
            </form>
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            <h2 className="text-lg font-medium mb-4">Attach Image</h2>
            <form className="space-y-3" onSubmit={handleImageSubmit}>
              <div>
                <label className="block text-gray-600 mb-1">Product ID</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={imageForm.productId}
                  onChange={(e) => setImageForm({ ...imageForm, productId: e.target.value })}
                  placeholder="product UUID"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Image URL</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={imageForm.imageUrl}
                  onChange={(e) => setImageForm({ ...imageForm, imageUrl: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Alt text</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={imageForm.altText}
                  onChange={(e) => setImageForm({ ...imageForm, altText: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Position</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  value={imageForm.position}
                  onChange={(e) => setImageForm({ ...imageForm, position: Number(e.target.value) })}
                />
              </div>
              <button
                type="submit"
                className="bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                disabled={!user}
              >
                Add image
              </button>
            </form>
          </div>
        </div>

        {(message || error) && (
          <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: message ? '#16a34a' : '#dc2626' }}>
            <p className={message ? 'text-green-600' : 'text-red-600'}>{message || error}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
