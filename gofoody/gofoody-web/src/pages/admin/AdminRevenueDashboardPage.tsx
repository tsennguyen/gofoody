import { useEffect, useMemo, useState } from 'react';
import { getRevenueByDay, getRevenueByMonth } from '../../api/adminDashboardApi';
import type {
  RevenueDailyResponse,
  RevenueMonthlyResponse,
  RevenueOverviewDto,
  RevenueDailyPointDto,
  RevenueMonthlyPointDto,
} from '../../api/types';

type Mode = 'day' | 'month';

const AdminRevenueDashboardPage = () => {
  const today = new Date();
  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

  const [mode, setMode] = useState<Mode>('day');
  const [fromDate, setFromDate] = useState<string>(toIsoDate(new Date(today.getTime() - 29 * 86400000)));
  const [toDate, setToDate] = useState<string>(toIsoDate(today));
  const [year, setYear] = useState<number>(today.getFullYear());

  const [dailyData, setDailyData] = useState<RevenueDailyResponse | null>(null);
  const [monthlyData, setMonthlyData] = useState<RevenueMonthlyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'day') {
        const res = await getRevenueByDay({ fromDate, toDate });
        setDailyData(res);
      } else {
        const res = await getRevenueByMonth({ year });
        setMonthlyData(res);
      }
    } catch (err) {
      console.error(err);
      setError('Không tải được dữ liệu doanh thu.');
    } finally {
      setLoading(false);
    }
  };

  const overview: RevenueOverviewDto | null = useMemo(() => {
    if (mode === 'day' && dailyData) return dailyData.overview;
    if (mode === 'month' && monthlyData) return monthlyData.overview;
    return null;
  }, [mode, dailyData, monthlyData]);

  const dailyRows: Array<{ label: string; revenue: number; orders: number }> = useMemo(() => {
    if (!dailyData) return [];
    return dailyData.points.map((p) => ({
      label: formatDateLabel(p.date),
      revenue: p.revenue,
      orders: p.ordersCount,
    }));
  }, [dailyData]);

  const monthlyRows: Array<{ label: string; revenue: number; orders: number }> = useMemo(() => {
    if (!monthlyData) return [];
    return monthlyData.points.map((p) => ({
      label: `${p.month}/${p.year}`,
      revenue: p.revenue,
      orders: p.ordersCount,
    }));
  }, [monthlyData]);

  const chartData = mode === 'day' ? dailyRows : monthlyRows;
  const maxRevenue = chartData.reduce((max, x) => Math.max(max, x.revenue), 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Dashboard doanh thu</h1>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setMode('day')}
          style={mode === 'day' ? primaryButton : button}
        >
          Theo ngày
        </button>
        <button
          onClick={() => setMode('month')}
          style={mode === 'month' ? primaryButton : button}
        >
          Theo tháng
        </button>

        {mode === 'day' && (
          <>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={input} />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={input} />
            <button onClick={loadData} style={button}>
              Lọc
            </button>
          </>
        )}
        {mode === 'month' && (
          <>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={input}>
              {[0, 1, 2].map((offset) => {
                const y = today.getFullYear() - offset;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
            <button onClick={loadData} style={button}>
              Lọc
            </button>
          </>
        )}
      </div>

      {error && <div style={{ color: '#dc2626' }}>{error}</div>}
      {loading && <div>Đang tải...</div>}

      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <KpiCard title="Tổng doanh thu" value={`${formatCurrency(overview.totalRevenue)} đ`} />
          <KpiCard title="Tổng đơn" value={overview.totalOrders} />
          <KpiCard title="Giá trị đơn TB" value={`${formatCurrency(overview.averageOrderValue)} đ`} />
          <KpiCard title="Hôm nay" value={`${formatCurrency(overview.todayRevenue)} đ`} />
          <KpiCard title="Tháng này" value={`${formatCurrency(overview.thisMonthRevenue)} đ`} />
          <KpiCard title="Tháng trước" value={`${formatCurrency(overview.previousMonthRevenue)} đ`} />
        </div>
      )}

      {/* Chart đơn giản: thanh ngang theo revenue */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Biểu đồ doanh thu ({mode === 'day' ? 'ngày' : 'tháng'})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {chartData.map((row) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#4b5563' }}>{row.label}</div>
              <div style={{ background: '#e5e7eb', height: 10, borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(row.revenue / maxRevenue) * 100}%`,
                    height: '100%',
                    background: '#16a34a',
                  }}
                />
              </div>
              <div style={{ fontSize: 12, textAlign: 'right' }}>{formatCurrency(row.revenue)} đ</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={th}>Kỳ</th>
              <th style={th}>Doanh thu</th>
              <th style={th}>Số đơn</th>
              <th style={th}>AOV</th>
            </tr>
          </thead>
          <tbody>
            {mode === 'day' &&
              dailyData?.points.map((p) => (
                <tr key={p.date}>
                  <td style={td}>{formatDateLabel(p.date)}</td>
                  <td style={td}>{formatCurrency(p.revenue)} đ</td>
                  <td style={td}>{p.ordersCount}</td>
                  <td style={td}>{formatCurrency(p.averageOrderValue)} đ</td>
                </tr>
              ))}
            {mode === 'month' &&
              monthlyData?.points.map((p) => (
                <tr key={`${p.year}-${p.month}`}>
                  <td style={td}>
                    Tháng {p.month}/{p.year}
                  </td>
                  <td style={td}>{formatCurrency(p.revenue)} đ</td>
                  <td style={td}>{p.ordersCount}</td>
                  <td style={td}>{formatCurrency(p.averageOrderValue)} đ</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatCurrency = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const KpiCard = ({ title, value }: { title: string; value: string | number }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#fff' }}>
    <div style={{ fontSize: 13, color: '#6b7280' }}>{title}</div>
    <div style={{ fontSize: 18, fontWeight: 700 }}>{value}</div>
  </div>
);

const button: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
};

const primaryButton: React.CSSProperties = {
  ...button,
  border: '1px solid #16a34a',
  background: '#16a34a',
  color: '#fff',
};

const input: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
};

const th: React.CSSProperties = { textAlign: 'left', padding: 8, borderBottom: '1px solid #e5e7eb' };
const td: React.CSSProperties = { padding: 8, borderBottom: '1px solid #e5e7eb' };

export default AdminRevenueDashboardPage;
