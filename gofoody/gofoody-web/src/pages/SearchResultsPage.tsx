import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/searchApi';
import type { ProductSearchFilterRequest, ProductSearchResponse } from '../api/types';

const dietOptions = [
  { label: 'Eat clean', slug: 'eat-clean' },
  { label: 'Ăn kiêng', slug: 'an-kieng' },
  { label: 'Keto', slug: 'keto' },
  { label: 'Low carb', slug: 'low-carb' },
];

const ingredientOptions = [
  { label: 'Thịt bò', slug: 'thit-bo' },
  { label: 'Thịt gà', slug: 'thit-ga' },
  { label: 'Cá hồi', slug: 'ca-hoi' },
  { label: 'Tôm', slug: 'tom' },
];

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { search } = useLocation();

  const [data, setData] = useState<ProductSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filter = useMemo<ProductSearchFilterRequest>(() => {
    const q = searchParams.get('query') || '';
    const categoryId = searchParams.get('categoryId');
    const diet = searchParams.getAll('diet');
    const ing = searchParams.getAll('ingredient');
    const sortBy = (searchParams.get('sort') as ProductSearchFilterRequest['sortBy']) || 'relevance';
    const page = Number(searchParams.get('page') || 1);
    return {
      query: q,
      categoryId: categoryId ? Number(categoryId) : null,
      dietTags: diet.length ? diet : null,
      ingredientTags: ing.length ? ing : null,
      sortBy,
      page,
      pageSize: 12,
    };
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    searchProducts(filter)
      .then(setData)
      .catch(() => setError('Không tải được kết quả.'))
      .finally(() => setLoading(false));
  }, [filter, search]);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const toggleArrayParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    const current = next.getAll(key);
    if (current.includes(val)) {
      const updated = current.filter((c) => c !== val);
      next.delete(key);
      updated.forEach((u) => next.append(key, u));
    } else {
      next.append(key, val);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const pageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page.toString());
    setSearchParams(next);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      <aside style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Bộ lọc</h3>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Từ khóa</label>
        <input
          defaultValue={filter.query ?? ''}
          onBlur={(e) => updateParam('query', e.target.value)}
          placeholder='Nhập tên sản phẩm'
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db' }}
        />

        <label style={{ display: 'block', margin: '12px 0 6px', fontWeight: 600 }}>Sắp xếp</label>
        <select
          value={filter.sortBy}
          onChange={(e) => updateParam('sort', e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db' }}
        >
          <option value="relevance">Liên quan</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="newest">Mới nhất</option>
        </select>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Ăn kiêng / Eat clean</div>
          {dietOptions.map((o) => (
            <label key={o.slug} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={filter.dietTags?.includes(o.slug) ?? false}
                onChange={() => toggleArrayParam('diet', o.slug)}
              />
              {o.label}
            </label>
          ))}
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Nguyên liệu</div>
          {ingredientOptions.map((o) => (
            <label key={o.slug} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={filter.ingredientTags?.includes(o.slug) ?? false}
                onChange={() => toggleArrayParam('ingredient', o.slug)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{filter.query ? `Kết quả cho "${filter.query}"` : 'Kết quả tìm kiếm'}</h1>
          {data?.suggestedTerms?.length ? (
            <div style={{ marginTop: 6, fontSize: 14, color: '#6b7280' }}>
              Có thể bạn muốn tìm:
              {data.suggestedTerms.map((t) => (
                <button
                  key={t}
                  onClick={() => updateParam('query', t)}
                  style={{
                    marginLeft: 8,
                    padding: '4px 8px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {data && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {data.items.map((p) => (
                <Link
                  to={`/product/${p.slug}`}
                  key={p.productId}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: 12,
                    background: '#fff',
                    textDecoration: 'none',
                    color: '#111827',
                  }}
                >
                  <div style={{ fontWeight: 700, minHeight: 42 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{p.categoryName}</div>
                  <div style={{ color: '#d11f28', fontWeight: 800, marginTop: 4 }}>
                    {p.minPrice.toLocaleString('vi-VN')} đ
                    {p.maxPrice && p.maxPrice !== p.minPrice ? ` - ${p.maxPrice.toLocaleString('vi-VN')} đ` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {p.dietTags.map((t) => (
                      <span key={t} style={chipStyle}>{t}</span>
                    ))}
                    {p.ingredientTags.map((t) => (
                      <span key={t} style={chipStyle}>{t}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              <button disabled={data.page <= 1} onClick={() => pageChange(data.page - 1)} style={pageBtnStyle}>
                ← Trước
              </button>
              <span>
                Trang {data.page} / {data.totalPages}
              </span>
              <button
                disabled={data.page >= data.totalPages}
                onClick={() => pageChange(data.page + 1)}
                style={pageBtnStyle}
              >
                Sau →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const chipStyle: React.CSSProperties = {
  padding: '2px 6px',
  borderRadius: 6,
  background: '#f3f4f6',
  fontSize: 11,
  border: '1px solid #e5e7eb',
};

const pageBtnStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #e5e7eb',
  background: '#fff',
  cursor: 'pointer',
};

export default SearchResultsPage;

