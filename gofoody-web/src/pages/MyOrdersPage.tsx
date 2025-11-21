import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getMyOrders, type MyOrdersQuery } from '../api/orderApi';
import type { OrderListItemDto, OrderStatus, PagedResult } from '../api/types';

const statusOptions: { value?: OrderStatus; label: string }[] = [
  { label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Confirmed', label: 'Đã xác nhận' },
  { value: 'Shipping', label: 'Đang giao' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

const MyOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PagedResult<OrderListItemDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const query: MyOrdersQuery = { page, pageSize, status: statusFilter };
    try {
      const data = await getMyOrders(query);
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = (status: OrderStatus) => {
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

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Đơn hàng của tôi</h1>
      <p style={{ marginBottom: 12 }}>Xin chào, {user?.fullName}</p>

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>Lọc trạng thái:</span>
        <select
          value={statusFilter ?? ''}
          onChange={(e) => {
            const val = e.target.value as OrderStatus;
            setStatusFilter(val || undefined);
            setPage(1);
          }}
          style={inputStyle}
        >
          {statusOptions.map((opt) => (
            <option key={opt.label} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Đang tải...</div>}

      {orders && orders.items.length === 0 && <div>Chưa có đơn hàng.</div>}

      {orders && orders.items.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={thStyle}>Mã đơn</th>
                <th style={thStyle}>Ngày</th>
                <th style={thStyle}>Tổng</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thanh toán</th>
                <th style={thStyle}>Giao hàng</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((o) => (
                <tr
                  key={o.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/my-orders/${o.orderCode}`)}
                >
                  <td style={tdStyle}>{o.orderCode}</td>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>{o.totalAmount.toLocaleString()} đ</td>
                  <td style={tdStyle}>{renderStatus(o.status)}</td>
                  <td style={tdStyle}>{renderPaymentStatus(o.paymentStatus)}</td>
                  <td style={tdStyle}>{o.shippingMethodName ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders && orders.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={buttonStyle}
          >
            Trang trước
          </button>
          <span style={{ alignSelf: 'center' }}>
            {page}/{orders.totalPages}
          </span>
          <button
            disabled={page >= orders.totalPages}
            onClick={() => setPage((p) => Math.min(orders.totalPages, p + 1))}
            style={buttonStyle}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
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

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};

export default MyOrdersPage;
