import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMyOrderDetail } from '../api/orderApi';
import type { OrderDetailDto } from '../api/types';

const MyOrderDetailPage = () => {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode) return;
    setLoading(true);
    setError(null);
    getMyOrderDetail(orderCode)
      .then(setOrder)
      .catch((err) => {
        console.error(err);
        setError('Không tải được chi tiết đơn hàng.');
      })
      .finally(() => setLoading(false));
  }, [orderCode]);

  const renderStatus = (status: string) => {
    switch (status) {
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
        return status;
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
  if (!order) return <div>Không tìm thấy đơn hàng.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Chi tiết đơn hàng</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>Mã đơn:</span>
        <strong>{order.orderCode}</strong>
      </div>
      <div>Ngày tạo: {new Date(order.createdAt).toLocaleString()}</div>
      <div>Trạng thái: {renderStatus(order.status)}</div>
      <div>Thanh toán: {renderPaymentStatus(order.paymentStatus)}</div>
      <div>
        Địa chỉ giao: <strong>{order.shippingAddress}</strong>
      </div>
      {order.note && <div>Ghi chú: {order.note}</div>}
      <div>
        Phương thức giao hàng: {order.shippingMethodName ?? '-'} | Thanh toán: {order.paymentMethodName ?? '-'}
      </div>

      <h3 style={{ marginTop: 12, marginBottom: 6 }}>Sản phẩm</h3>
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
        <div style={{ fontWeight: 700 }}>
          Tổng cộng: {order.totalAmount.toLocaleString()} đ
        </div>
      </div>

      <Link to="/my-orders" style={linkStyle}>
        Quay lại danh sách đơn
      </Link>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 14,
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 14,
};

const linkStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 8,
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  textDecoration: 'none',
  color: '#111827',
};

export default MyOrderDetailPage;
