import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/authApi';
import type { RegisterRequest } from '../api/types';
import { useAuth } from '../auth/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginFromAuthResponse } = useAuth();
  const [form, setForm] = useState<RegisterRequest & { confirmPassword: string }>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError('Mật khẩu phải dài tối thiểu 6 ký tự.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      loginFromAuthResponse(res);
      navigate('/customer', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Đăng ký thất bại. Vui lòng thử lại hoặc đổi email/phone khác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Đăng ký</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelStyle}>
          Họ và tên
          <input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </label>
        <label style={labelStyle}>
          Số điện thoại (tuỳ chọn)
          <input
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            style={inputStyle}
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
        <label style={labelStyle}>
          Nhập lại mật khẩu
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
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
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
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

export default RegisterPage;
