import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getAdminOrderDetail,
  updateOrderStatus,
} from '../api/orderApi';
import type { OrderDetailDto, OrderStatus, PaymentStatus } from '../api/types';

const statusOptions: OrderStatus[] = ['Pending', 'Confirmed', 'Shipping', 'Completed', 'Cancelled'];
const paymentOptions: PaymentStatus[] = ['Unpaid', 'Paid', 'Refunded'];

const AdminOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Unpaid');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminOrderDetail(Number(orderId));
      setOrder(data);
      setStatus(data.status);
      setPaymentStatus(data.paymentStatus);
    } catch (err) {
      console.error(err);
      setError('Không tải được chi tiết đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!order) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, { status, paymentStatus });
      setOrder(updated);
    } catch (err) {
      console.error(err);
      setError('Cập nhật trạng thái thất bại.');
    } finally {
      setUpdating(false);
    }
  };

  const renderStatus = (s: string) => {
    switch (s) {
      case 'Pending':
        return 'Chờ xử lý';
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'Shipping':
        return 'Đang giao';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return s;
    }
  };

  const renderPaymentStatus = (s: string) => {
    switch (s) {
      case 'Unpaid':
        return 'Chưa thanh toán';
      case 'Paid':
        return 'Đã thanh toán';
      case 'Refunded':
        return 'Hoàn tiền';
      default:
        return s;
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: '#dc2626' }}>{error}</div>;
  if (!order) return <div>Không tìm thấy đơn.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Chi tiết đơn hàng (Admin)</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <div>Mã đơn: <strong>{order.orderCode}</strong></div>
        <div>Ngày: {new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div>Khách: {order.customerName} | {order.customerPhone} | {order.customerEmail ?? '-'}</div>
      <div>Địa chỉ: {order.shippingAddress}</div>
      <div>Trạng thái: {renderStatus(order.status)} | Thanh toán: {renderPaymentStatus(order.paymentStatus)}</div>
      <div>Giao hàng: {order.shippingMethodName ?? '-'} | Thanh toán: {order.paymentMethodName ?? '-'}</div>
      {order.note && <div>Ghi chú: {order.note}</div>}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={thStyle}>Sản phẩm</th>
              <th style={thStyle}>Đơn giá</th>
              <th style={thStyle}>SL</th>
              <th style={thStyle}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <td style={tdStyle}>
                  {i.productName} ({i.unit})
                </td>
                <td style={tdStyle}>{i.unitPrice.toLocaleString()} đ</td>
                <td style={tdStyle}>{i.quantity}</td>
                <td style={tdStyle}>{i.lineTotal.toLocaleString()} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ alignSelf: 'flex-end', marginTop: 8 }}>
        <div>Tạm tính: {order.subtotal.toLocaleString()} đ</div>
        <div>Phí giao hàng: {order.shippingFee.toLocaleString()} đ</div>
        <div style={{ fontWeight: 700 }}>Tổng cộng: {order.totalAmount.toLocaleString()} đ</div>
      </div>

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', maxWidth: 520 }}>
        <div>
          <label style={labelStyle}>Trạng thái</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} style={inputStyle}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {renderStatus(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Thanh toán</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            style={inputStyle}
          >
            {paymentOptions.map((s) => (
              <option key={s} value={s}>
                {renderPaymentStatus(s)}
              </option>
            ))}
          </select>
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button type="button" onClick={handleUpdate} disabled={updating} style={primaryButtonStyle}>
            {updating ? 'Đang cập nhật...' : 'Cập nhật'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={() => navigate('/admin/orders')} style={buttonStyle}>
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, marginBottom: 4 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #16a34a',
  background: '#16a34a',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  width: '100%',
};

export default AdminOrderDetailPage;
