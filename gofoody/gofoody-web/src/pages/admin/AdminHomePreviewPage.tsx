import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../api/categoryApi';
import { getProducts } from '../../api/productApi';
import type { CategoryDto, ProductListItemDto } from '../../api/types';
import HomeHeroSlider from '../../components/home/HomeHeroSlider';
import FlashSaleSection from '../../components/home/FlashSaleSection';
import ProductCard from '../../components/catalog/ProductCard';

type LoadState = 'idle' | 'loading' | 'error' | 'success';

const AdminHomePreviewPage = () => {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductListItemDto[]>([]);
  const [state, setState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [onlyCold, setOnlyCold] = useState(false);

  useEffect(() => {
    const load = async () => {
      setState('loading');
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts({ page: 1, pageSize: 30, sort: 'newest' }),
        ]);
        setCategories(cats);
        setProducts(prods.items);
        setState('success');
      } catch (err) {
        setError('Không tải được dữ liệu preview');
        setState('error');
      }
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoryName === selectedCategory);
    }
    if (onlyCold) {
      list = list.filter((p) => p.requiresColdShipping);
    }
    if (onlyDiscount) {
      list = list.filter((p) => (p.maxPrice ?? p.minPrice * 1.12) > p.minPrice);
    }
    return list;
  }, [products, selectedCategory, onlyCold, onlyDiscount]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
      <aside
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 12,
          height: 'fit-content',
          position: 'sticky',
          top: 90,
        }}
      >
        <h3 style={{ margin: '0 0 8px' }}>Bộ lọc preview</h3>
        <label style={labelStyle}>Danh mục</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={inputStyle}
        >
          <option value="all">Tất cả</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <label style={checkboxStyle}>
          <input type="checkbox" checked={onlyDiscount} onChange={(e) => setOnlyDiscount(e.target.checked)} /> Chỉ
          sản phẩm giảm giá
        </label>
        <label style={checkboxStyle}>
          <input type="checkbox" checked={onlyCold} onChange={(e) => setOnlyCold(e.target.checked)} /> Sản phẩm cần
          giao lạnh
        </label>
        <div style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>
          Đang hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/" target="_blank" rel="noreferrer" style={previewLinkStyle}>
            Xem như khách
          </Link>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ padding: '12px 0' }}>
          <h1 style={{ margin: 0 }}>Admin home preview</h1>
          <p style={{ margin: '4px 0', color: '#6b7280' }}>
            Sử dụng cùng layout với trang khách để kiểm tra banner, danh mục, sản phẩm.
          </p>
        </div>

        <HomeHeroSlider />

        {state === 'loading' && <p>Đang tải dữ liệu...</p>}
        {state === 'error' && <p style={{ color: 'red' }}>{error}</p>}
        {state === 'success' && (
          <>
            <FlashSaleSection products={filteredProducts} />

            <section style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Sản phẩm xem trước</h2>
              </div>
              {filteredProducts.length === 0 && <p>Không có sản phẩm theo bộ lọc.</p>}
              {filteredProducts.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: 12,
                  }}
                >
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  marginBottom: 8,
};

const labelStyle: CSSProperties = {
  fontWeight: 600,
  marginBottom: 4,
  display: 'block',
};

const checkboxStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 6,
  fontSize: 14,
};

const previewLinkStyle: CSSProperties = {
  display: 'inline-block',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  background: '#fff',
  textDecoration: 'none',
  fontWeight: 700,
};

export default AdminHomePreviewPage;
