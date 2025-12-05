import { FormEvent, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productsApi, collectionsApi, categoriesApi, uploadToCloudinary } from '../api'
import { useAuth } from '../context/AuthContext'

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({ queryKey: ['products'], queryFn: productsApi.list })
  const { data: collections } = useQuery({ queryKey: ['collections'], queryFn: collectionsApi.list })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list })
  const { user } = useAuth()

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

  type ImageEntry = { file?: File | null; altText: string }
  const [images, setImages] = useState<ImageEntry[]>([{ file: null, altText: '' }])

  const [message, setMessage] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)


  const submitProduct = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setErrMsg(null)
    try {
      const payload: any = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        priceAmount: Number(form.priceAmount),
        priceCurrency: form.priceCurrency,
        collectionId: form.collectionId || undefined,
        categoryId: form.categoryId || undefined,
        isActive: form.isActive,
      }

      const product = await productsApi.create(payload)
      // Upload and attach any images provided
      const filesToUpload = images.filter((img) => img.file)
      if (filesToUpload.length) {
        setUploading(true)
        filesToUpload.forEach(async (img, idx) => {
          const imageUrl = await uploadToCloudinary(img.file as File)
          await productsApi.addImage(product.id, {
            imageUrl,
            altText: img.altText,
            position: idx,
          })
        })
      }

      setMessage(`Created ${product.title}${filesToUpload.length ? ' with images' : ''}`)
      setForm({
        title: '',
        slug: '',
        description: '',
        priceAmount: '',
        priceCurrency: 'RWF',
        collectionId: '',
        categoryId: '',
        isActive: true,
      })
      setImages([{ file: null, altText: '' }])
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message || 'Failed to create product')
    } finally {
      setUploading(false)
    }
  }

  const collectionOptions = useMemo(() => collections ?? [], [collections])
  const categoryOptions = useMemo(() => categories ?? [], [categories])

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <p style={{ color: '#64748b' }}>Manage products and visibility</p>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && <p style={{ color: '#dc2626' }}>Failed to load products</p>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Create product</h3>
        {!user && <p style={{ color: '#dc2626' }}>Login required.</p>}
        <form className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', rowGap: '1rem' }} onSubmit={submitProduct}>
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <select
            className="input"
            value={form.collectionId}
            onChange={(e) => setForm({ ...form, collectionId: e.target.value })}
          >
            <option value="">Select collection</option>
            {collectionOptions.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {categoryOptions.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Price amount" type="number" value={form.priceAmount} onChange={(e) => setForm({ ...form, priceAmount: e.target.value })} required />
          <select className="input" value={form.priceCurrency} onChange={(e) => setForm({ ...form, priceCurrency: e.target.value })}>
            <option value="RWF">RWF</option>
            <option value="USD">USD</option>
          </select>
          <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>Images (optional)</h4>
                <button
                  type="button"
                  className="pill"
                  onClick={() => setImages((imgs) => [...imgs, { file: null, altText: '' }])}
                >
                + Add image
              </button>
            </div>
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(180px, 1fr))' }}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '0.75rem',
                    borderStyle: 'dashed',
                    borderColor: '#cbd5e1',
                    position: 'relative',
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files?.[0] || null
                    if (file) {
                      setImages((prev) => prev.map((p, i) => (i === idx ? { ...p, file } : p)))
                    }
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setImages((prev) => prev.map((p, i) => (i === idx ? { ...p, file } : p)))
                      }}
                    />
                    {img.file ? img.file.name : 'Drag & drop or click to choose'}
                  </label>
                  {img.file && (
                    <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                      <img
                        src={URL.createObjectURL(img.file)}
                        alt={img.altText || 'Preview'}
                        style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </div>
                  )}
                  <input
                    className="input"
                    placeholder="Alt text"
                    value={img.altText}
                    onChange={(e) => setImages((prev) => prev.map((p, i) => (i === idx ? { ...p, altText: e.target.value } : p)))}
                  />
                </div>
              ))}
            </div>
          </div>
          <button className="button" type="submit" disabled={!user}>
            {uploading ? 'Creating…' : 'Create'}
          </button>
        </form>
      </div>

      {(message || errMsg) && (
        <div className="card" style={{ borderColor: message ? '#16a34a' : '#dc2626' }}>
          <p style={{ margin: 0, color: message ? '#166534' : '#b91c1c' }}>{message || errMsg}</p>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Collection</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((product: any) => (
              <tr key={product.id} style={{ cursor: 'pointer' }}>
                <td>
                  <Link to={`/products/${product.slug}`}>{product.title}</Link>
                </td>
                <td>{product.collection?.name ?? '—'}</td>
                <td>{product.category?.name ?? '—'}</td>
                <td>
                  {product.priceAmount} {product.priceCurrency}
                </td>
                <td>
                  <span className="badge">{product.isActive ? 'Active' : 'Hidden'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
