import { useEffect, useState } from 'react';
import type { ProductListItemDto } from '../../api/types';
import ProductCard from '../catalog/ProductCard';

interface Props {
  products: ProductListItemDto[];
}

const FlashSaleSection = ({ products }: Props) => {
  const [remaining, setRemaining] = useState<number>(3 * 24 * 60 * 60); // default 3 ngày

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(remaining / (24 * 3600));
  const hours = Math.floor((remaining % (24 * 3600)) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const hotProducts = products.slice(0, 6);

  return (
    <section style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#d11f28' }}>Flash Sale</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {[days, hours, minutes, seconds].map((v, idx) => (
            <div
              key={idx}
              style={{
                minWidth: 48,
                padding: '6px 8px',
                background: '#111827',
                color: '#fef3c7',
                borderRadius: 8,
                textAlign: 'center',
                fontWeight: 700,
              }}
            >
              {v.toString().padStart(2, '0')}
              <div style={{ fontSize: 10, color: '#d1d5db' }}>
                {idx === 0 ? 'Ngày' : idx === 1 ? 'Giờ' : idx === 2 ? 'Phút' : 'Giây'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {hotProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default FlashSaleSection;
