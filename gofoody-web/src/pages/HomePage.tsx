import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/categoryApi';
import { getProducts } from '../api/productApi';
import type { CategoryDto, ProductListItemDto } from '../api/types';
import HomeHeroSlider from '../components/home/HomeHeroSlider';
import FlashSaleSection from '../components/home/FlashSaleSection';
import ProductCard from '../components/catalog/ProductCard';
import PersonalRecommendationsSection from '../components/PersonalRecommendationsSection';

type LoadState = 'idle' | 'loading' | 'error' | 'success';

const HomePage = () => {
  const [categoryState, setCategoryState] = useState<LoadState>('idle');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [productState, setProductState] = useState<LoadState>('idle');
  const [products, setProducts] = useState<ProductListItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoryState('loading');
      try {
        const res = await getCategories();
        setCategories(res);
        setCategoryState('success');
      } catch (err) {
        setError('Không thể tải danh mục');
        setCategoryState('error');
      }
    };

    const fetchProducts = async () => {
      setProductState('loading');
      try {
        const res = await getProducts({ page: 1, pageSize: 16, sort: 'newest' });
        setProducts(res.items);
        setProductState('success');
      } catch (err) {
        setError('Không thể tải sản phẩm');
        setProductState('error');
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  const featured = products.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <HomeHeroSlider />
      <FlashSaleSection products={products} />

      <section style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Danh mục nổi bật</h2>
        </div>
        {categoryState === 'loading' && <p>Đang tải danh mục...</p>}
        {categoryState === 'error' && <p style={{ color: 'red' }}>{error}</p>}
        {categoryState === 'success' && categories.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.slug}
                to={`/category/${c.slug}`}
                className="card-hover"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  color: '#111827',
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                {c.description && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{c.description}</div>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Sản phẩm nổi bật</h2>
        </div>
        {productState === 'loading' && <p>Đang tải sản phẩm...</p>}
        {productState === 'error' && <p style={{ color: 'red' }}>{error}</p>}
        {productState === 'success' && featured.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: 12,
            }}
          >
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <PersonalRecommendationsSection />
    </div>
  );
};

export default HomePage;
