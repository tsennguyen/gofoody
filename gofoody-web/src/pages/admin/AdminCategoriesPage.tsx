import { useEffect, useState } from 'react';
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategoryDetail,
  updateAdminCategory,
} from '../../api/adminCategoryApi';
import type {
  CategoryAdminDetailDto,
  CategoryAdminListItemDto,
  CategoryAdminUpsertRequest,
  PagedResult,
} from '../../api/types';

const AdminCategoriesPage = () => {
  const [list, setList] = useState<PagedResult<CategoryAdminListItemDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [isActive, setIsActive] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryAdminUpsertRequest>({
    name: '',
    slug: '',
    description: '',
    parentId: null,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, isActive]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCategories({
        page,
        pageSize,
        keyword: keyword || undefined,
        isActive: isActive === '' ? undefined : isActive === 'true',
      });
      setList(data);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      parentId: null,
      isActive: true,
      sortOrder: 0,
    });
  };

  const startEdit = async (id: number) => {
    try {
      const detail = await getAdminCategoryDetail(id);
      setEditingId(id);
      setForm({
        name: detail.name,
        slug: detail.slug,
        description: detail.description ?? '',
        parentId: detail.parentId ?? null,
        isActive: detail.isActive,
        sortOrder: detail.sortOrder,
      });
    } catch (err) {
      console.error(err);
      setError('Không tải được chi tiết danh mục');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId === null) {
        await createAdminCategory(form);
      } else {
        await updateAdminCategory(editingId, form);
      }
      await loadList();
      startCreate();
    } catch (err) {
      console.error(err);
      setError('Lưu danh mục thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa mềm danh mục này?')) return;
    try {
      await deleteAdminCategory(id);
      await loadList();
    } catch (err) {
      console.error(err);
      setError('Xóa danh mục thất bại');
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '2fr 1fr' }}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Danh mục</h2>
          <div style={{ display: 'flex', gap: 8 }}>
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
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              style={inputStyle}
            >
              <option value="">Tất cả</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
        {loading && <div>Đang tải...</div>}
        {list && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={thStyle}>Tên</th>
                  <th style={thStyle}>Slug</th>
                  <th style={thStyle}>SP</th>
                  <th style={thStyle}>Thứ tự</th>
                  <th style={thStyle}>Active</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((c) => (
                  <tr key={c.id}>
                    <td style={tdStyle}>{c.name}</td>
                    <td style={tdStyle}>{c.slug}</td>
                    <td style={tdStyle}>{c.productCount}</td>
                    <td style={tdStyle}>{c.sortOrder}</td>
                    <td style={tdStyle}>{c.isActive ? 'Yes' : 'No'}</td>
                    <td style={tdStyle}>
                      <button style={btn} onClick={() => startEdit(c.id)}>
                        Sửa
                      </button>{' '}
                      <button style={btn} onClick={() => handleDelete(c.id)}>
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

      <div style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId === null ? 'Thêm danh mục' : `Sửa #${editingId}`}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>
            Tên
            <input name="name" value={form.name} onChange={onChange} style={inputStyle} required />
          </label>
          <label style={labelStyle}>
            Slug (để trống sẽ tự tạo)
            <input name="slug" value={form.slug ?? ''} onChange={onChange} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Mô tả
            <textarea name="description" value={form.description ?? ''} onChange={onChange} style={{ ...inputStyle, minHeight: 60 }} />
          </label>
          <label style={labelStyle}>
            Sort order
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder ?? 0}
              onChange={onChange}
              style={inputStyle}
            />
          </label>
          <label style={{ ...labelStyle, flexDirection: 'row', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>
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
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' };
const tdStyle: React.CSSProperties = { padding: 8, borderBottom: '1px solid #e5e7eb' };
const btn: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' };
const primaryButton: React.CSSProperties = { padding: '10px', borderRadius: 6, border: '1px solid #16a34a', background: '#16a34a', color: '#fff', cursor: 'pointer' };
const card: React.CSSProperties = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.04)' };

export default AdminCategoriesPage;
