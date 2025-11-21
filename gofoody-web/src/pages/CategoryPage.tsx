import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getCategories, getCategoryBySlug } from '../api/categoryApi';
import { getProducts, type ProductListQuery } from '../api/productApi';
import type { CategoryDto, PagedResult, ProductListItemDto } from '../api/types';
import ProductCard from '../components/catalog/ProductCard';
import Pagination from '../components/common/Pagination';

type LoadState = 'idle' | 'loading' | 'error' | 'success';
type SortOption = 'newest' | 'priceAsc' | 'priceDesc';

const parseNumberParam = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolParam = (value: string | null): boolean | undefined => {
  if (value === null) return undefined;
  return value === 'true';
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState<CategoryDto | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [catState, setCatState] = useState<LoadState>('idle');
  const [catError, setCatError] = useState<string | null>(null);

  const [products, setProducts] = useState<PagedResult<ProductListItemDto> | null>(null);
  const [productState, setProductState] = useState<LoadState>('idle');
  const [productError, setProductError] = useState<string | null>(null);

  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const [isOrganicInput, setIsOrganicInput] = useState<boolean>(false);
  const [hasHaccpInput, setHasHaccpInput] = useState<boolean>(false);
  const [isSeasonalInput, setIsSeasonalInput] = useState<boolean>(false);
  const [requiresColdShippingInput, setRequiresColdShippingInput] = useState<boolean>(false);
  const [sortInput, setSortInput] = useState<SortOption>('newest');

  // Đồng bộ input với query string khi URL thay đổi
  useEffect(() => {
    const sp = searchParams;
    setMinPriceInput(sp.get('minPrice') ?? '');
    setMaxPriceInput(sp.get('maxPrice') ?? '');
    setIsOrganicInput(sp.get('isOrganic') === 'true');
    setHasHaccpInput(sp.get('hasHaccp') === 'true');
    setIsSeasonalInput(sp.get('isSeasonal') === 'true');
    setRequiresColdShippingInput(sp.get('requiresColdShipping') === 'true');
    const sortParam = sp.get('sort') as SortOption | null;
    setSortInput(sortParam ?? 'newest');
  }, [searchParams]);

  useEffect(() => {
    // load danh mục bên trái
    getCategories()
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const fetchCategory = async () => {
      setCatState('loading');
      setCatError(null);
      try {
        const data = await getCategoryBySlug(slug);
        setCategory(data);
        setCatState('success');
      } catch (err) {
        setCategory(null);
        setCatState('error');
        setCatError('Không tìm thấy danh mục hoặc lỗi khi tải danh mục.');
      }
    };
    fetchCategory();
  }, [slug]);

  const queryFromSearch = useMemo<ProductListQuery>(() => {
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const parsedPage = Number.isFinite(page) && page > 0 ? page : 1;
    return {
      page: parsedPage,
      pageSize: 12,
      categorySlug: slug,
      minPrice: parseNumberParam(searchParams.get('minPrice')),
      maxPrice: parseNumberParam(searchParams.get('maxPrice')),
      isOrganic: parseBoolParam(searchParams.get('isOrganic')),
      hasHaccp: parseBoolParam(searchParams.get('hasHaccp')),
      isSeasonal: parseBoolParam(searchParams.get('isSeasonal')),
      requiresColdShipping: parseBoolParam(searchParams.get('requiresColdShipping')),
      sort: (searchParams.get('sort') as SortOption | null) ?? 'newest',
    };
  }, [searchParams, slug]);

  useEffect(() => {
    if (!slug) return;
    const fetchProducts = async () => {
      setProductState('loading');
      setProductError(null);
      try {
        const data = await getProducts(queryFromSearch);
        setProducts(data);
        setProductState('success');
      } catch (err) {
        setProducts(null);
        setProductState('error');
        setProductError('Không thể tải sản phẩm.');
      }
    };
    fetchProducts();
  }, [slug, queryFromSearch]);

  const handleApplyFilters = () => {
    const next = new URLSearchParams(searchParams);

    if (minPriceInput) next.set('minPrice', minPriceInput);
    else next.delete('minPrice');

    if (maxPriceInput) next.set('maxPrice', maxPriceInput);
    else next.delete('maxPrice');

    if (isOrganicInput) next.set('isOrganic', 'true');
    else next.delete('isOrganic');

    if (hasHaccpInput) next.set('hasHaccp', 'true');
    else next.delete('hasHaccp');

    if (isSeasonalInput) next.set('isSeasonal', 'true');
    else next.delete('isSeasonal');

    if (requiresColdShippingInput) next.set('requiresColdShipping', 'true');
    else next.delete('requiresColdShipping');

    next.set('sort', sortInput);
    next.set('page', '1'); // reset page when apply filters

    setSearchParams(next);
  };

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', page.toString());
    setSearchParams(next);
  };

  const pageTitle = category?.name ?? 'Danh mục';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/category/${c.slug}`}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              textDecoration: 'none',
              color: slug === c.slug ? '#d11f28' : '#111827',
              background: slug === c.slug ? '#fde2e4' : '#f9fafb',
              border: '1px solid #e5e7eb',
              fontWeight: 600,
            }}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          padding: 12,
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flex: '1 1 240px' }}>
          <input
            type="number"
            placeholder="Min price"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            style={inputStyle}
          />
        </div>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={isOrganicInput}
            onChange={(e) => setIsOrganicInput(e.target.checked)}
          />
          Organic
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={hasHaccpInput}
            onChange={(e) => setHasHaccpInput(e.target.checked)}
          />
          HACCP
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={isSeasonalInput}
            onChange={(e) => setIsSeasonalInput(e.target.checked)}
          />
          Theo mùa
        </label>
        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={requiresColdShippingInput}
            onChange={(e) => setRequiresColdShippingInput(e.target.checked)}
          />
          Giao lạnh
        </label>
        <div style={{ minWidth: 160 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Sắp xếp</label>
          <select
            value={sortInput}
            onChange={(e) => setSortInput(e.target.value as SortOption)}
            style={{ ...inputStyle, width: '100%' }}
          >
            <option value="newest">Mới nhất</option>
            <option value="priceAsc">Giá tăng dần</option>
            <option value="priceDesc">Giá giảm dần</option>
          </select>
        </div>
        <button onClick={handleApplyFilters} style={applyButtonStyle}>
          Áp dụng
        </button>
      </div>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{pageTitle}</h1>
          {category?.description && (
            <p style={{ marginTop: 6, color: '#4b5563' }}>{category.description}</p>
          )}
          {catState === 'error' && <p style={{ color: 'red' }}>{catError}</p>}
        </div>

        {productState === 'loading' && <p>Đang tải sản phẩm...</p>}
        {productState === 'error' && <p style={{ color: 'red' }}>{productError}</p>}
        {productState === 'success' && products?.items.length === 0 && <p>Chưa có sản phẩm.</p>}
        {productState === 'success' && products && products.items.length > 0 && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16,
              }}
            >
              {products.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination page={products.page} totalPages={products.totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </main>
    </div>
  );
};

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  flex: 1,
};

const checkboxStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
};

const applyButtonStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #16a34a',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

export default CategoryPage;
