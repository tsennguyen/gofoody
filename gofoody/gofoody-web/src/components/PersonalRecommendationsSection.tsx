import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getRecommendationsForMe } from '../api/recommendationApi';
import type { ProductRecommendationItemDto } from '../api/types';

const PersonalRecommendationsSection: React.FC = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [items, setItems] = useState<ProductRecommendationItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return;
    setLoading(true);
    setError(null);
    getRecommendationsForMe()
      .then((res) => setItems(res.items))
      .catch(() => setError('Không tải được gợi ý'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isCustomer]);

  if (!isAuthenticated || !isCustomer) return null;
  if (loading) return <div>Đang tải gợi ý cho bạn...</div>;
  if (error) return null;
  if (!items.length) return null;

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Gợi ý cho riêng bạn</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {items.map((p) => (
          <Link
            key={p.productId}
            to={`/product/${p.slug}`}
            style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, textDecoration: 'none', color: '#111827' }}
          >
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{p.categoryName}</div>
            <div style={{ color: '#d11f28', fontWeight: 800, marginTop: 4 }}>
              {p.minPrice.toLocaleString('vi-VN')} đ
            </div>
            <div style={{ fontSize: 12, color: '#2563eb', marginTop: 4 }}>{p.reason}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PersonalRecommendationsSection;

