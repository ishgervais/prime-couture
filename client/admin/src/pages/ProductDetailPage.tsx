import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../api'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const qc = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: !!slug,
  })

  const toggleVisibility = useMutation({
    mutationFn: async ({ productId, imageId, isVisible }: { productId: string; imageId: string; isVisible: boolean }) =>
      productsApi.updateImage(productId, imageId, { isVisible }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['product-detail', slug] }),
  })

  if (!slug) return <p>Missing slug</p>
  if (isLoading) return <p>Loading…</p>
  if (error) return <p style={{ color: '#dc2626' }}>Failed to load product</p>
  if (!data) return <p>Not found</p>

  return (
    <div>
      <div className="header-row">
        <div>
          <h2 style={{ margin: 0 }}>{data.title}</h2>
          <p style={{ color: '#64748b' }}>{data.slug}</p>
        </div>
        <Link to="/products" className="pill">
          Back to products
        </Link>
      </div>

      <div className="card-grid">
        <div className="card">
          <h4 style={{ marginTop: 0 }}>Details</h4>
          <p>{data.description}</p>
          <p>
            Price: {data.priceAmount} {data.priceCurrency}
          </p>
          <p>Collection: {data.collection?.name ?? '—'}</p>
          <p>Category: {data.category?.name ?? '—'}</p>
          <p>Status: {data.isActive ? 'Active' : 'Hidden'}</p>
          <p>Views: {data.viewCount ?? 0}</p>
          <p>Created: {new Date(data.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(data.updatedAt).toLocaleString()}</p>
        </div>
        <div className="card">
          <h4 style={{ marginTop: 0 }}>Images</h4>
          {data.images?.length ? (
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))' }}>
              {data.images
                .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
                .map((img: any) => (
                  <div key={img.id} className="card" style={{ padding: '0.5rem' }}>
                    <img
                      src={img.file?.url ?? img.url ?? img.imageUrl}
                      alt={img.altText || data.title}
                      style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', opacity: img.isVisible ? 1 : 0.45 }}
                    />
                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Pos {img.position ?? 0}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{img.altText || 'No alt'}</div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        className="button"
                        style={{ padding: '0.35rem 0.75rem' }}
                        onClick={() =>
                          toggleVisibility.mutate({
                            productId: data.id,
                            imageId: img.id,
                            isVisible: !img.isVisible,
                          })
                        }
                      >
                        {img.isVisible ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p>No images</p>
          )}
        </div>
      </div>
    </div>
  )
}
