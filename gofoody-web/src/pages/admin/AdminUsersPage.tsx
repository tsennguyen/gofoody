import { useEffect, useState } from 'react';
import {
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUser,
} from '../../api/adminUserApi';
import type { PagedResult, UserAdminDetailDto, UserAdminListItemDto, UserAdminUpdateRequest } from '../../api/types';

const AdminUsersPage = () => {
  const [list, setList] = useState<PagedResult<UserAdminListItemDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UserAdminDetailDto | null>(null);
  const [form, setForm] = useState<UserAdminUpdateRequest>({
    fullName: '',
    phone: '',
    isActive: true,
    roleCodes: ['CUSTOMER'],
  });

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, role, isActive]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({
        page,
        pageSize,
        keyword: keyword || undefined,
        role: role || undefined,
        isActive: isActive === '' ? undefined : isActive === 'true',
      });
      setList(data);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách user');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = async (id: number) => {
    try {
      const d = await getAdminUserDetail(id);
      setEditingId(id);
      setDetail(d);
      setForm({
        fullName: d.fullName,
        phone: d.phone ?? '',
        isActive: d.isActive,
        roleCodes: d.roles,
      });
    } catch (err) {
      console.error(err);
      setError('Không tải được user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    try {
      await updateAdminUser(editingId, form);
      await loadList();
      setEditingId(null);
      setDetail(null);
    } catch (err) {
      console.error(err);
      setError('Lưu user thất bại');
    }
  };

  const toggleRole = (roleCode: string) => {
    setForm((prev) => {
      const has = prev.roleCodes.includes(roleCode);
      return {
        ...prev,
        roleCodes: has ? prev.roleCodes.filter((r) => r !== roleCode) : [...prev.roleCodes, roleCode],
      };
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Người dùng</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Tìm tên/email/phone"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">All roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="CUSTOMER">CUSTOMER</option>
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
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Roles</th>
                  <th style={thStyle}>Active</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((u) => (
                  <tr key={u.id}>
                    <td style={tdStyle}>{u.fullName}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.phone ?? '-'}</td>
                    <td style={tdStyle}>{u.roles.join(', ')}</td>
                    <td style={tdStyle}>{u.isActive ? 'Yes' : 'No'}</td>
                    <td style={tdStyle}>
                      <button style={btn} onClick={() => startEdit(u.id)}>
                        Sửa
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
        <h3 style={{ marginTop: 0 }}>Chỉnh sửa user</h3>
        {!detail && <div>Chọn user để chỉnh sửa</div>}
        {detail && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>
              Họ tên
              <input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                style={inputStyle}
                required
              />
            </label>
            <label style={labelStyle}>
              Điện thoại
              <input
                value={form.phone ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={inputStyle}
              />
            </label>
            <label style={{ ...labelStyle, flexDirection: 'row', gap: 6 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>

            <div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Roles</div>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.roleCodes.includes('ADMIN')}
                  onChange={() => toggleRole('ADMIN')}
                /> ADMIN
              </label>
              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.roleCodes.includes('CUSTOMER')}
                  onChange={() => toggleRole('CUSTOMER')}
                /> CUSTOMER
              </label>
            </div>

            <button type="submit" disabled={editingId === null} style={primaryButton}>
              Lưu
            </button>
            <button type="button" style={btn} onClick={() => setEditingId(null)}>
              Đóng
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: '100%' };
const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 };
const checkboxLabel: React.CSSProperties = { display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' };
const tdStyle: React.CSSProperties = { padding: 8, borderBottom: '1px solid #e5e7eb' };
const btn: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' };
const primaryButton: React.CSSProperties = { padding: '10px', borderRadius: 6, border: '1px solid #16a34a', background: '#16a34a', color: '#fff', cursor: 'pointer' };

export default AdminUsersPage;
