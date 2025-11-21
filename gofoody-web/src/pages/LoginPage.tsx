import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authApi';
import type { LoginRequest } from '../api/types';
import { useAuth } from '../auth/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginFromAuthResponse } = useAuth();
  const [form, setForm] = useState<LoginRequest>({ emailOrPhone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(form);
      loginFromAuthResponse(res);
      const roles = res.user.roles ?? [];
      if (roles.includes('ADMIN')) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError('Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Đăng nhập</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelStyle}>
          Email hoặc SĐT
          <input
            name="emailOrPhone"
            type="text"
            value={form.emailOrPhone}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        {error && <div style={{ color: '#dc2626', fontSize: 13 }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 12px',
            borderRadius: 6,
            border: 'none',
            background: '#16a34a',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
};

const labelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14 };
const inputStyle: React.CSSProperties = {
  padding: '10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  fontSize: 14,
};

export default LoginPage;
