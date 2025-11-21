import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useCart } from '../../cart/CartContext';
import { getCategories } from '../../api/categoryApi';
import type { CategoryDto } from '../../api/types';
import SearchBar from '../SearchBar';

const linkStyle: CSSProperties = { fontWeight: 600, textDecoration: 'none' };

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const totalQty = cart?.totalQuantity ?? 0;
  const inAdmin = pathname.startsWith('/admin');

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    // preload danh mục cho mega menu
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ borderBottom: '1px solid #e5e7eb', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
      {/* Top bar */}
      <div
        style={{
          background: '#f5f5f5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 16px',
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db' }}>
            <option>Hà Nội</option>
            <option>TP.HCM</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#d11f28', fontWeight: 700 }}>1800 6093</span>
          <span style={{ color: '#4b5563' }}>8:00 - 21:00</span>
          {!isAuthenticated && !inAdmin && (
            <Link to="/login" style={{ ...smallButtonStyle, borderRadius: 999 }}>
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      {/* Main nav */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 20,
        }}
      >
        <Link to="/" style={{ fontSize: 22, fontWeight: 800, color: '#d11f28', minWidth: 120 }}>
          GOFOODY
        </Link>

        {!inAdmin && (
          <>
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setOpenMenu(true)}
              onMouseLeave={() => setOpenMenu(false)}
            >
              <button
                type="button"
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  background: '#f5f5f5',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Danh mục
              </button>
              {openMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    minWidth: 300,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                    padding: 12,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 8,
                    zIndex: 30,
                  }}
                >
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/category/${c.slug}`}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        textDecoration: 'none',
                        color: '#111827',
                        fontWeight: 600,
                        background: pathname === `/category/${c.slug}` ? '#f3f4f6' : 'transparent',
                      }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1, maxWidth: 400, minWidth: 260 }}>
              <SearchBar />
            </div>

            <nav style={{ display: 'flex', gap: 20, alignItems: 'center', marginLeft: 24 }}>
              <Link
                to="/about"
                style={{ ...linkStyle, color: pathname === '/about' ? '#d11f28' : '#111827' }}
              >
                Giới thiệu
              </Link>
              <Link
                to="/my-orders"
                style={{ ...linkStyle, color: pathname.startsWith('/my-orders') ? '#d11f28' : '#111827' }}
              >
                Đơn hàng
              </Link>
              <Link
                to="/cart"
                style={{
                  ...linkStyle,
                  color: pathname === '/cart' ? '#d11f28' : '#111827',
                  position: 'relative',
                }}
              >
                Giỏ hàng
                {totalQty > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -12,
                      background: '#d11f28',
                      color: '#fff',
                      borderRadius: 999,
                      padding: '2px 6px',
                      fontSize: 12,
                    }}
                  >
                    {totalQty}
                  </span>
                )}
              </Link>
            </nav>
          </>
        )}

        {inAdmin && (
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
            <Link to="/" style={smallButtonStyle}>
              Về trang khách
            </Link>
            <Link to="/admin/categories" style={smallButtonStyle}>
              QL danh mục
            </Link>
            <Link to="/admin/orders" style={smallButtonStyle}>
              QL đơn hàng
            </Link>
            <Link to="/admin/products" style={smallButtonStyle}>
              QL sản phẩm
            </Link>
            <Link to="/admin/users" style={smallButtonStyle}>
              QL tài khoản
            </Link>
            <Link to="/admin/shipping-methods" style={smallButtonStyle}>
              QL giao hàng
            </Link>
            <Link to="/admin/dashboard/revenue" style={smallButtonStyle}>
              Doanh thu
            </Link>
            <Link to="/admin/home-preview" style={smallButtonStyle}>
              Preview home
            </Link>
          </nav>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
          {isAuthenticated && (
            <>
              <span style={{ fontSize: 13, color: '#111827' }}>Xin chào, {user?.fullName}</span>
              <button type="button" onClick={handleLogout} style={smallButtonStylePrimary}>
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const smallButtonStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  textDecoration: 'none',
  color: '#111827',
  cursor: 'pointer',
};

const smallButtonStylePrimary: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d11f28',
  background: '#d11f28',
  color: '#fff',
  textDecoration: 'none',
  cursor: 'pointer',
};

export default Header;
