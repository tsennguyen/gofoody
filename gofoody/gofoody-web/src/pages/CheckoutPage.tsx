import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { useAuth } from '../auth/AuthContext';
import {
  checkout as checkoutApi,
  getPaymentMethods,
  getShippingMethods,
} from '../api/orderApi';
import type {
  CheckoutRequest,
  OrderCreatedDto,
  PaymentMethodDto,
  ShippingMethodDto,
} from '../api/types';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();
  const { cart, clearCart, loadCart } = useCart();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
  const [form, setForm] = useState<CheckoutRequest>({
    fullName: user?.fullName ?? '',
    phone: user?.phone ?? '',
    addressLine: '',
    ward: '',
    district: '',
    city: '',
    shippingMethodId: 0,
    paymentMethodId: 0,
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCreated, setOrderCreated] = useState<OrderCreatedDto | null>(null);

  useEffect(() => {
    loadOptions().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOptions = async () => {
    try {
      const [shippings, payments] = await Promise.all([
        getShippingMethods(),
        getPaymentMethods(),
      ]);
      setShippingMethods(shippings);
      setPaymentMethods(payments);
      setForm((prev) => ({
        ...prev,
        shippingMethodId: shippings[0]?.id ?? 0,
        paymentMethodId: payments[0]?.id ?? 0,
      }));
    } catch (err) {
      console.error(err);
      setError('Không tải được phương thức giao hàng/thanh toán.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!cart || cart.items.length === 0) {
      setError('Giỏ hàng trống.');
      return;
    }
    if (!form.fullName || !form.phone || !form.addressLine || !form.shippingMethodId || !form.paymentMethodId) {
      setError('Vui lòng nhập đủ thông tin và chọn phương thức giao hàng/thanh toán.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await checkoutApi(form);
      setOrderCreated(order);
      await clearCart();
      await loadCart();
    } catch (err) {
      console.error(err);
      setError('Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const orderSummary = useMemo(() => {
    if (!cart) return null;
    return (
      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 12,
          background: '#fff',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Tóm tắt đơn hàng</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cart.items.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <div>
                {item.productName} ({item.variantName}) x {item.quantity}
              </div>
              <div>{item.lineTotal.toLocaleString()} đ</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 700 }}>
          <span>Tạm tính</span>
          <span>{cart.subtotal.toLocaleString()} đ</span>
        </div>
        {cart.requiresColdShipping && (
          <div style={{ fontSize: 12, color: '#0ea5e9', marginTop: 4 }}>Một số sản phẩm cần giao lạnh.</div>
        )}
      </div>
    );
  }, [cart]);

  if (!isCustomer) {
    return <Navigate to="/login" replace />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Checkout</h1>
        <p>Giỏ hàng trống. Vui lòng quay lại giỏ hàng.</p>
        <button type="button" onClick={() => navigate('/cart')} style={buttonStyle}>
          Về giỏ hàng
        </button>
      </div>
    );
  }

  if (orderCreated) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Đặt hàng thành công</h1>
        <p>Mã đơn hàng: <strong>{orderCreated.orderCode}</strong></p>
        <p>Tổng tiền: {orderCreated.totalAmount.toLocaleString()} đ</p>
        <p>Thời gian: {new Date(orderCreated.createdAt).toLocaleString()}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="button" onClick={() => navigate('/customer')} style={buttonStyle}>
            Xem đơn hàng trong trang khách hàng
          </button>
          <button type="button" onClick={() => navigate('/')} style={buttonStyleOutline}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '2fr 1fr' }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Checkout</h1>
        {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <label style={labelStyle}>
              Họ tên
              <input name="fullName" value={form.fullName} onChange={handleChange} style={inputStyle} required />
            </label>
            <label style={labelStyle}>
              Số điện thoại
              <input name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
            </label>
          </div>
          <label style={labelStyle}>
            Địa chỉ
            <input name="addressLine" value={form.addressLine} onChange={handleChange} style={inputStyle} required />
          </label>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <label style={labelStyle}>
              Phường/Xã
              <input name="ward" value={form.ward} onChange={handleChange} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Quận/Huyện
              <input name="district" value={form.district} onChange={handleChange} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Tỉnh/Thành phố
              <input name="city" value={form.city} onChange={handleChange} style={inputStyle} />
            </label>
          </div>
          <label style={labelStyle}>
            Ghi chú
            <textarea name="note" value={form.note ?? ''} onChange={handleChange} style={{ ...inputStyle, minHeight: 80 }} />
          </label>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>Phương thức giao hàng</h3>
              <select
                name="shippingMethodId"
                value={form.shippingMethodId}
                onChange={(e) => setForm((prev) => ({ ...prev, shippingMethodId: Number(e.target.value) }))}
                style={inputStyle}
              >
                {shippingMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.baseFee.toLocaleString()} đ)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h3 style={{ marginTop: 0, marginBottom: 6 }}>Phương thức thanh toán</h3>
              <select
                name="paymentMethodId"
                value={form.paymentMethodId}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMethodId: Number(e.target.value) }))}
                style={inputStyle}
              >
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={submitting} style={primaryButtonStyle}>
            {submitting ? 'Đang đặt hàng...' : 'Đặt hàng'}
          </button>
        </form>
      </div>

      <div>{orderSummary}</div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};

const buttonStyleOutline: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 6,
  border: '1px solid #16a34a',
  background: '#16a34a',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
};

export default CheckoutPage;
