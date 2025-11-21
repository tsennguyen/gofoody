import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div>
    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>404 - Không tìm thấy</h1>
    <p>Trang bạn truy cập không tồn tại.</p>
    <Link to="/" style={{ color: '#16a34a', fontWeight: 600 }}>
      Về trang chủ
    </Link>
  </div>
);

export default NotFoundPage;
