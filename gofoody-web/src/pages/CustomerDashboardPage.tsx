import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router-dom';

const CustomerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Xin chào, {user?.fullName ?? 'Khách hàng'}
      </h1>
      <p style={{ marginBottom: 12 }}>Trang khách hàng của bạn.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" style={linkStyle}>
          Về trang chủ
        </Link>
        <Link to="/category/hai-san" style={linkStyle}>
          Khám phá sản phẩm
        </Link>
        <Link to="/my-orders" style={linkStyle}>
          Đơn hàng của tôi
        </Link>
      </div>
    </div>
  );
};

const linkStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  textDecoration: 'none',
  color: '#111827',
  background: '#fff',
};

export default CustomerDashboardPage;
