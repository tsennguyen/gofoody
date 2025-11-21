import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminOrders,
  getOrderStats,
  type AdminOrdersQuery,
} from '../api/orderApi';
import type { OrderListItemDto, OrderStatus, PaymentStatus, OrderStatsDto, PagedResult } from '../api/types';

const statusOptions: { value?: OrderStatus; label: string }[] = [
  { label: 'Tất cả' },
  { value: 'Pending', label: 'Chờ xử lý' },
  { value: 'Confirmed', label: 'Đã xác nhận' },
  { value: 'Shipping', label: 'Đang giao' },
  { value: 'Completed', label: 'Hoàn thành' },
  { value: 'Cancelled', label: 'Đã hủy' },
];

const paymentOptions: { value?: PaymentStatus; label: string }[] = [
  { label: 'Tất cả' },
  { value: 'Unpaid', label: 'Chưa thanh toán' },
  { value: 'Paid', label: 'Đã thanh toán' },
  { value: 'Refunded', label: 'Hoàn tiền' },
];

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PagedResult<OrderListItemDto> | null>(null);
  const [stats, setStats] = useState<OrderStatsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<AdminOrdersQuery>({
    page: 1,
    pageSize: 20,
    status: undefined,
    paymentStatus: undefined,
    orderCode: '',
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.status, filters.paymentStatus]);

  useEffect(() => {
    loadStats().catch(() => undefined);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getOrderStats(filters.fromDate as string | undefined, filters.toDate as string | undefined);
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    const query: AdminOrdersQuery = { ...filters };
    try {
      const data = await getAdminOrders(query);
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Không tải được danh sách đơn.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadOrders();
    loadStats().catch(() => undefined);
  };

  const renderStatus = (s: OrderStatus) => {
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

  const renderPaymentStatus = (s: PaymentStatus) => {
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

  const statsCards = useMemo(() => {
    if (!stats) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
        <StatCard title="Tổng đơn" value={stats.totalOrders} />
        <StatCard title="Đang chờ" value={stats.pendingOrders} />
        <StatCard title="Hoàn thành" value={stats.completedOrders} />
        <StatCard title="Hủy" value={stats.cancelledOrders} />
        <StatCard title="Doanh thu" value={`${stats.totalRevenue.toLocaleString()} đ`} />
        <StatCard title="Hôm nay" value={`${stats.todayRevenue.toLocaleString()} đ`} />
        <StatCard title="Tháng này" value={`${stats.thisMonthRevenue.toLocaleString()} đ`} />
      </div>
    );
  }, [stats]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Quản lý đơn hàng</h1>

      {statsCards}

      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end', marginBottom: 12 }}>
        <div>
          <label style={labelStyle}>Mã đơn</label>
          <input
            value={filters.orderCode ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, orderCode: e.target.value }))}
            style={inputStyle}
            placeholder="Tìm theo mã"
          />
        </div>
        <div>
          <label style={labelStyle}>Trạng thái</label>
          <select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, status: (e.target.value as OrderStatus) || undefined }))}
            style={inputStyle}
          >
            {statusOptions.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Thanh toán</label>
          <select
            value={filters.paymentStatus ?? ''}
            onChange={(e) =>
              setFilters((p) => ({ ...p, paymentStatus: (e.target.value as PaymentStatus) || undefined }))
            }
            style={inputStyle}
          >
            {paymentOptions.map((opt) => (
              <option key={opt.label} value={opt.value ?? ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Từ ngày</label>
          <input
            type="date"
            value={filters.fromDate ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, fromDate: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Đến ngày</label>
          <input
            type="date"
            value={filters.toDate ?? ''}
            onChange={(e) => setFilters((p) => ({ ...p, toDate: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <button type="button" onClick={applyFilter} style={primaryButtonStyle}>
            Lọc
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}
      {loading && <div>Đang tải...</div>}

      {orders && orders.items.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Mã đơn</th>
                <th style={thStyle}>Ngày</th>
                <th style={thStyle}>Tổng</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((o) => (
                <tr
                  key={o.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                >
                  <td style={tdStyle}>{o.id}</td>
                  <td style={tdStyle}>{o.orderCode}</td>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>{o.totalAmount.toLocaleString()} đ</td>
                  <td style={tdStyle}>{renderStatus(o.status)}</td>
                  <td style={tdStyle}>{renderPaymentStatus(o.paymentStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orders && orders.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            disabled={filters.page! <= 1}
            onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
            style={buttonStyle}
          >
            Trang trước
          </button>
          <span style={{ alignSelf: 'center' }}>
            {filters.page}/{orders.totalPages}
          </span>
          <button
            disabled={filters.page! >= orders.totalPages}
            onClick={() =>
              setFilters((p) => ({
                ...p,
                page: Math.min(orders.totalPages, (p.page ?? 1) + 1),
              }))
            }
            style={buttonStyle}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
    <div style={{ fontSize: 13, color: '#6b7280' }}>{title}</div>
    <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
  </div>
);

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, marginBottom: 4 };
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
};

const thStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #e5e7eb',
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

export default AdminOrdersPage;
