import { useEffect, useState } from 'react';
import {
  createAdminShippingMethod,
  deleteAdminShippingMethod,
  getAdminShippingMethodDetail,
  getAdminShippingMethods,
  updateAdminShippingMethod,
} from '../../api/adminShippingApi';
import type { ShippingMethodAdminDto, ShippingMethodAdminUpsertRequest } from '../../api/types';

const AdminShippingMethodsPage = () => {
  const [list, setList] = useState<ShippingMethodAdminDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ShippingMethodAdminUpsertRequest>({
    code: '',
    name: '',
    description: '',
    isColdShipping: false,
    baseFee: 0,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveFilter]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminShippingMethods({
        isActive: isActiveFilter === '' ? undefined : isActiveFilter === 'true',
      });
      setList(data);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách phương thức giao hàng');
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      code: '',
      name: '',
      description: '',
      isColdShipping: false,
      baseFee: 0,
      isActive: true,
      sortOrder: 0,
    });
  };

  const startEdit = async (id: number) => {
    try {
      const d = await getAdminShippingMethodDetail(id);
      setEditingId(id);
      setForm({
        code: d.code,
        name: d.name,
        description: d.description ?? '',
        isColdShipping: d.isColdShipping,
        baseFee: d.baseFee,
        isActive: d.isActive,
        sortOrder: d.sortOrder ?? 0,
      });
    } catch (err) {
      console.error(err);
      setError('Không tải được chi tiết phương thức');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId === null) {
        await createAdminShippingMethod(form);
      } else {
        await updateAdminShippingMethod(editingId, form);
      }
      await loadList();
      startCreate();
    } catch (err) {
      console.error(err);
      setError('Lưu phương thức thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa (soft) phương thức này?')) return;
    try {
      await deleteAdminShippingMethod(id);
      await loadList();
    } catch (err) {
      console.error(err);
      setError('Xóa phương thức thất bại');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Phương thức giao hàng</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="">Tất cả</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
        {loading && <div>Đang tải...</div>}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Tên</th>
                <th style={thStyle}>Fee</th>
                <th style={thStyle}>Cold</th>
                <th style={thStyle}>Active</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td style={tdStyle}>{m.code}</td>
                  <td style={tdStyle}>{m.name}</td>
                  <td style={tdStyle}>{m.baseFee.toLocaleString()} đ</td>
                  <td style={tdStyle}>{m.isColdShipping ? 'Yes' : 'No'}</td>
                  <td style={tdStyle}>{m.isActive ? 'Yes' : 'No'}</td>
                  <td style={tdStyle}>
                    <button style={btn} onClick={() => startEdit(m.id)}>
                      Sửa
                    </button>{' '}
                    <button style={btn} onClick={() => handleDelete(m.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>{editingId === null ? 'Thêm phương thức' : `Sửa #${editingId}`}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={labelStyle}>
            Code
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              style={inputStyle}
              required
            />
          </label>
          <label style={labelStyle}>
            Tên
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
              required
            />
          </label>
          <label style={labelStyle}>
            Mô tả
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ ...inputStyle, minHeight: 60 }}
            />
          </label>
          <label style={labelStyle}>
            Base fee
            <input
              type="number"
              value={form.baseFee}
              onChange={(e) => setForm((f) => ({ ...f, baseFee: Number(e.target.value) }))}
              style={inputStyle}
              required
            />
          </label>
          <label style={{ ...labelStyle, flexDirection: 'row', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.isColdShipping}
              onChange={(e) => setForm((f) => ({ ...f, isColdShipping: e.target.checked }))}
            />
            Cold shipping
          </label>
          <label style={{ ...labelStyle, flexDirection: 'row', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            Active
          </label>
          <label style={labelStyle}>
            Sort order
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              style={inputStyle}
            />
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

export default AdminShippingMethodsPage;
