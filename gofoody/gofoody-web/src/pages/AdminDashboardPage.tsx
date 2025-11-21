import { useState } from 'react';
import { Link } from 'react-router-dom';
import httpClient from '../api/httpClient';
import { useAuth } from '../auth/AuthContext';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [adminTestResult, setAdminTestResult] = useState<string>('');
  const [customerTestResult, setCustomerTestResult] = useState<string>('');

  const callAdminTest = async () => {
    try {
      const { data } = await httpClient.get<string>('/api/admin/test');
      setAdminTestResult(`OK: ${data}`);
    } catch (err) {
      console.error(err);
      setAdminTestResult('Lỗi hoặc không đủ quyền');
    }
  };

  const callCustomerTest = async () => {
    try {
      const { data } = await httpClient.get<string>('/api/customer/test');
      setCustomerTestResult(`OK: ${data}`);
    } catch (err) {
      console.error(err);
      setCustomerTestResult('Lỗi hoặc không đủ quyền');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Xin chào, {user?.fullName ?? 'Admin'} (Admin)
      </h1>
      <p style={{ marginBottom: 16 }}>Trang quản trị đơn giản để kiểm tra phân quyền.</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={callAdminTest} style={buttonStyle}>
          Gọi /api/admin/test
        </button>
        <button type="button" onClick={callCustomerTest} style={buttonStyle}>
          Gọi /api/customer/test
        </button>
        <Link to="/admin/orders" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Quản lý đơn hàng
        </Link>
        <Link to="/admin/categories" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Quản lý danh mục
        </Link>
        <Link to="/admin/products" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Quản lý sản phẩm
        </Link>
        <Link to="/admin/users" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Quản lý tài khoản
        </Link>
        <Link to="/admin/shipping-methods" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Phương thức giao hàng
        </Link>
        <Link to="/admin/dashboard/revenue" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Dashboard doanh thu
        </Link>
        <Link to="/admin/home-preview" style={{ ...buttonStyle, textDecoration: 'none' }}>
          Preview trang chủ
        </Link>
      </div>
      <div style={{ fontSize: 14 }}>
        <div>Kết quả admin: {adminTestResult || '-'}</div>
        <div>Kết quả customer: {customerTestResult || '-'}</div>
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};

export default AdminDashboardPage;
