import { useEffect, useState } from 'react';
import {
  createAdminProduct,
  getAdminProductDetail,
  getAdminProducts,
  updateAdminProduct,
  deleteAdminProduct,
} from '../../api/adminProductApi';
import { getAdminCategories } from '../../api/adminCategoryApi';
import type {
  CategoryAdminListItemDto,
  PagedResult,
  ProductAdminDetailDto,
  ProductAdminListItemDto,
  ProductAdminUpsertRequest,
  ProductImageAdminUpsertRequest,
  ProductVariantAdminUpsertRequest,
} from '../../api/types';

const emptyVariant = (): ProductVariantAdminUpsertRequest => ({
  id: null,
  name: '',
  unit: '',
  weightGrams: null,
  price: 0,
  listPrice: null,
  isFresh: false,
  isFrozen: false,
  isPrecut: false,
  requiresColdShipping: false,
  stockQuantity: 0,
  minOrderQuantity: 1,
  maxOrderQuantity: null,
  isActive: true,
});

const emptyImage = (): ProductImageAdminUpsertRequest => ({
  id: null,
  imageUrl: '',
  isDefault: false,
  sortOrder: 0,
});

const AdminProductsPage = () => {
  const [list, setList] = useState<PagedResult<ProductAdminListItemDto> | null>(null);
  const [categories, setCategories] = useState<CategoryAdminListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductAdminUpsertRequest>({
    name: '',
    slug: '',
    categoryId: 0,
    shortDescription: '',
    description: '',
    originCountry: '',
    brand: '',
    isOrganic: false,
    hasHaccpCert: false,
    isSeasonal: false,
    storageCondition: '',
    storageTempMin: null,
    storageTempMax: null,
    isActive: true,
    variants: [emptyVariant()],
    images: [emptyImage()],
  });

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, categoryId, isActive]);

  useEffect(() => {
    loadCategories().catch(() => undefined);
  }, []);

  const loadCategories = async () => {
    try {
      const res = await getAdminCategories({ page: 1, pageSize: 200, isActive: true });
      setCategories(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminProducts({
        page,
        pageSize,
        keyword: keyword || undefined,
        categoryId: categoryId === '' ? undefined : Number(categoryId),
        isActive: isActive === '' ? undefined : isActive === 'true',
      });
      setList(res);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      categoryId: 0,
      shortDescription: '',
      description: '',
      originCountry: '',
      brand: '',
      isOrganic: false,
      hasHaccpCert: false,
      isSeasonal: false,
      storageCondition: '',
      storageTempMin: null,
      storageTempMax: null,
      isActive: true,
      variants: [emptyVariant()],
      images: [emptyImage()],
    });
  };

  const startEdit = async (id: number) => {
    try {
      const detail = await getAdminProductDetail(id);
      setEditingId(id);
      setForm({
        name: detail.name,
        slug: detail.slug,
        categoryId: detail.categoryId,
        shortDescription: detail.shortDescription ?? '',
        description: detail.description ?? '',
        originCountry: detail.originCountry ?? '',
        brand: detail.brand ?? '',
        isOrganic: detail.isOrganic,
        hasHaccpCert: detail.hasHaccpCert,
        isSeasonal: detail.isSeasonal,
        storageCondition: detail.storageCondition ?? '',
        storageTempMin: detail.storageTempMin ?? null,
        storageTempMax: detail.storageTempMax ?? null,
        isActive: detail.isActive,
        variants: detail.variants.map((v) => ({
          ...v,
          id: v.id,
        })),
        images: detail.images.map((img) => ({ ...img, id: img.id })),
      });
    } catch (err) {
      console.error(err);
      setError('Không tải được chi tiết sản phẩm');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId === null) {
        await createAdminProduct(form);
      } else {
        await updateAdminProduct(editingId, form);
      }
      await loadList();
      startCreate();
    } catch (err) {
      console.error(err);
      setError('Lưu sản phẩm thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa mềm sản phẩm này?')) return;
    try {
      await deleteAdminProduct(id);
      await loadList();
    } catch (err) {
      console.error(err);
      setError('Xóa sản phẩm thất bại');
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantAdminUpsertRequest, value: any) => {
    setForm((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const handleImageChange = (index: number, field: keyof ProductImageAdminUpsertRequest, value: any) => {
    setForm((prev) => {
      const images = [...prev.images];
      images[index] = { ...images[index], [field]: value };
      return { ...prev, images };
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Sản phẩm</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Tìm tên/slug"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value === '' ? '' : Number(e.target.value));
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={isActive}
            onChange={(e) => {
              setIsActive(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
        {loading && <div>Đang tải...</div>}
        {list && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={thStyle}>Tên</th>
                  <th style={thStyle}>Danh mục</th>
                  <th style={thStyle}>Giá</th>
                  <th style={thStyle}>Tồn</th>
                  <th style={thStyle}>Active</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((p) => (
                  <tr key={p.id}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}>{p.categoryName}</td>
                    <td style={tdStyle}>
                      {p.minPrice.toLocaleString()} - {(p.maxPrice ?? p.minPrice).toLocaleString()} đ
                    </td>
                    <td style={tdStyle}>{p.totalStock}</td>
                    <td style={tdStyle}>{p.isActive ? 'Yes' : 'No'}</td>
                    <td style={tdStyle}>
                      <button style={btn} onClick={() => startEdit(p.id)}>
                        Sửa
                      </button>{' '}
                      <button style={btn} onClick={() => handleDelete(p.id)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {list && list.totalPages > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={btn}>
              Prev
            </button>
            <span>
              {page}/{list.totalPages}
            </span>
            <button disabled={page >= list.totalPages} onClick={() => setPage((p) => p + 1)} style={btn}>
              Next
            </button>
          </div>
        )}
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>{editingId === null ? 'Thêm sản phẩm' : `Sửa #${editingId}`}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={labelStyle}>
            Tên
            <input name="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} required />
          </label>
          <label style={labelStyle}>
            Slug (để trống tự tạo)
            <input
              name="slug"
              value={form.slug ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Danh mục
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
              style={inputStyle}
              required
            >
              <option value={0}>--Chọn--</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label style={labelStyle}>
            Mô tả ngắn
            <textarea
              value={form.shortDescription ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
              style={{ ...inputStyle, minHeight: 60 }}
            />
          </label>
          <label style={labelStyle}>
            Mô tả
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ ...inputStyle, minHeight: 80 }}
            />
          </label>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <label style={labelStyle}>
              Xuất xứ
              <input value={form.originCountry ?? ''} onChange={(e) => setForm((f) => ({ ...f, originCountry: e.target.value }))} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Thương hiệu
              <input value={form.brand ?? ''} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} style={inputStyle} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <label style={checkboxLabel}>
              <input type="checkbox" checked={form.isOrganic} onChange={(e) => setForm((f) => ({ ...f, isOrganic: e.target.checked }))} /> Organic
            </label>
            <label style={checkboxLabel}>
              <input type="checkbox" checked={form.hasHaccpCert} onChange={(e) => setForm((f) => ({ ...f, hasHaccpCert: e.target.checked }))} /> HACCP
            </label>
            <label style={checkboxLabel}>
              <input type="checkbox" checked={form.isSeasonal} onChange={(e) => setForm((f) => ({ ...f, isSeasonal: e.target.checked }))} /> Theo mùa
            </label>
            <label style={checkboxLabel}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} /> Active
            </label>
          </div>
          <label style={labelStyle}>
            Điều kiện lưu trữ
            <input
              value={form.storageCondition ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, storageCondition: e.target.value }))}
              style={inputStyle}
            />
          </label>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <label style={labelStyle}>
              Nhiệt độ min
              <input
                type="number"
                value={form.storageTempMin ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, storageTempMin: e.target.value ? Number(e.target.value) : null }))}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Nhiệt độ max
              <input
                type="number"
                value={form.storageTempMax ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, storageTempMax: e.target.value ? Number(e.target.value) : null }))}
                style={inputStyle}
              />
            </label>
          </div>

          <h4 style={{ marginBottom: 4 }}>Biến thể</h4>
          {form.variants.map((v, idx) => (
            <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, marginBottom: 8 }}>
              <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <input
                  placeholder="Tên"
                  value={v.name}
                  onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="Đơn vị"
                  value={v.unit}
                  onChange={(e) => handleVariantChange(idx, 'unit', e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Giá"
                  value={v.price}
                  onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Tồn"
                  value={v.stockQuantity}
                  onChange={(e) => handleVariantChange(idx, 'stockQuantity', Number(e.target.value))}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Min order"
                  value={v.minOrderQuantity}
                  onChange={(e) => handleVariantChange(idx, 'minOrderQuantity', Number(e.target.value))}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Max order"
                  value={v.maxOrderQuantity ?? ''}
                  onChange={(e) =>
                    handleVariantChange(idx, 'maxOrderQuantity', e.target.value ? Number(e.target.value) : null)
                  }
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={v.requiresColdShipping}
                    onChange={(e) => handleVariantChange(idx, 'requiresColdShipping', e.target.checked)}
                  />{' '}
                  Cold
                </label>
                <label style={checkboxLabel}>
                  <input type="checkbox" checked={v.isFresh} onChange={(e) => handleVariantChange(idx, 'isFresh', e.target.checked)} /> Fresh
                </label>
                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={v.isFrozen}
                    onChange={(e) => handleVariantChange(idx, 'isFrozen', e.target.checked)}
                  />{' '}
                  Frozen
                </label>
                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={v.isPrecut}
                    onChange={(e) => handleVariantChange(idx, 'isPrecut', e.target.checked)}
                  />{' '}
                  Precut
                </label>
                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={v.isActive}
                    onChange={(e) => handleVariantChange(idx, 'isActive', e.target.checked)}
                  />{' '}
                  Active
                </label>
              </div>
              <button
                type="button"
                style={{ ...btn, marginTop: 6 }}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    variants: prev.variants.filter((_, i) => i !== idx),
                  }))
                }
              >
                Xóa biến thể
              </button>
            </div>
          ))}
          <button
            type="button"
            style={btn}
            onClick={() => setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))}
          >
            + Thêm biến thể
          </button>

          <h4 style={{ marginBottom: 4 }}>Ảnh</h4>
          {form.images.map((img, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <input
                placeholder="Image URL"
                value={img.imageUrl}
                onChange={(e) => handleImageChange(idx, 'imageUrl', e.target.value)}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Sort"
                value={img.sortOrder}
                onChange={(e) => handleImageChange(idx, 'sortOrder', Number(e.target.value))}
                style={{ ...inputStyle, width: 80 }}
              />
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={img.isDefault}
                  onChange={(e) => handleImageChange(idx, 'isDefault', e.target.checked)}
                />{' '}
                Default
              </label>
              <button
                type="button"
                style={btn}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== idx),
                  }))
                }
              >
                Xóa ảnh
              </button>
            </div>
          ))}
          <button type="button" style={btn} onClick={() => setForm((p) => ({ ...p, images: [...p.images, emptyImage()] }))}>
            + Thêm ảnh
          </button>

          <button type="submit" style={primaryButton}>
            Lưu
          </button>
          {editingId !== null && (
            <button type="button" style={btn} onClick={startCreate}>
              Hủy chỉnh sửa
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: '100%' };
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 };
const checkboxLabel: React.CSSProperties = { display: 'flex', gap: 4, alignItems: 'center', fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' };
const tdStyle: React.CSSProperties = { padding: 8, borderBottom: '1px solid #e5e7eb' };
const btn: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' };
const primaryButton: React.CSSProperties = { padding: '10px', borderRadius: 6, border: '1px solid #16a34a', background: '#16a34a', color: '#fff', cursor: 'pointer' };

export default AdminProductsPage;
