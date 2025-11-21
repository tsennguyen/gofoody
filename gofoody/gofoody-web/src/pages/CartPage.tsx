import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext';

const CartPage = () => {
  const { cart, loading, error, updateItem, removeItem, loadCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // đảm bảo cart sync khi vào trang
    loadCart().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty = !cart || cart.items.length === 0;

  if (loading && !cart) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  if (isEmpty) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Giỏ hàng</h1>
        <p>Giỏ hàng trống.</p>
        <Link to="/" style={linkButton}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Giỏ hàng</h1>
      {error && <div style={{ color: '#dc2626' }}>{error}</div>}

      <div style={{ display: 'grid', gap: 12 }}>
        {cart!.items.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              background: '#fff',
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 8,
                overflow: 'hidden',
                background: '#f3f4f6',
              }}
            >
              <img
                src={
                  item.thumbnailUrl ||
                  'https://via.placeholder.com/150x150.png?text=GOFOODY'
                }
                alt={item.productName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{item.productName}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{item.variantName}</div>
              <div style={{ marginTop: 4, fontSize: 14 }}>
                Đơn giá: {item.unitPrice.toLocaleString()} đ
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <label style={{ fontSize: 13 }}>Số lượng:</label>
                <input
                  type="number"
                  value={item.quantity}
                  min={item.minOrderQuantity}
                  max={item.maxOrderQuantity ?? item.stockQuantity}
                  onChange={(e) => updateItem(item.id, Number(e.target.value))}
                  style={qtyInputStyle}
                />
              </div>
              <div style={{ marginTop: 6, fontWeight: 700 }}>
                Thành tiền: {item.lineTotal.toLocaleString()} đ
              </div>
              {item.requiresColdShipping && (
                <div style={{ fontSize: 12, color: '#0ea5e9' }}>Yêu cầu giao lạnh</div>
              )}
            </div>
            <button type="button" onClick={() => removeItem(item.id)} style={removeButtonStyle}>
              Xoá
            </button>
          </div>
        ))}
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
          <span>Tạm tính</span>
          <strong>{cart!.subtotal.toLocaleString()} đ</strong>
        </div>
        {cart!.requiresColdShipping && (
          <div style={{ marginTop: 4, fontSize: 12, color: '#0ea5e9' }}>
            Một số sản phẩm cần giao hàng lạnh.
          </div>
        )}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Link to="/" style={linkButton}>
            Tiếp tục mua sắm
          </Link>
          <button type="button" onClick={() => navigate('/checkout')} style={primaryButton}>
            Tiến hành đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
};

const qtyInputStyle: React.CSSProperties = {
  width: 80,
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
};

const removeButtonStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #ef4444',
  background: '#fff',
  color: '#ef4444',
  cursor: 'pointer',
};

const linkButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  textDecoration: 'none',
  color: '#111827',
  background: '#fff',
};

const primaryButton: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #16a34a',
  background: '#16a34a',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
};

export default CartPage;
