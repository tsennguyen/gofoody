import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: '#f7f7f7', borderTop: '1px solid #e5e7eb', marginTop: 32 }}>
    <div
      className="container"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        padding: '24px 16px',
      }}
    >
      <div>
        <h3 style={{ margin: '0 0 8px', color: '#d11f28' }}>GOFOODY</h3>
        <p style={{ margin: 0, color: '#4b5563', fontSize: 14 }}>
          Thực phẩm nhập khẩu chất lượng cao, giao nhanh, đảm bảo chuỗi lạnh từ kho đến bếp nhà bạn.
        </p>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px' }}>Về chúng tôi</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
          <Link to="/about">Giới thiệu</Link>
          <Link to="/shipping-policy">Chính sách giao hàng</Link>
          <Link to="/privacy-policy">Chính sách bảo mật</Link>
          <Link to="/terms">Điều khoản sử dụng</Link>
        </div>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px' }}>Hệ thống cửa hàng</h4>
        <p style={{ margin: 0, fontSize: 14 }}><strong>Hà Nội:</strong> 123 Nguyễn Trãi, Thanh Xuân</p>
        <p style={{ margin: '4px 0', fontSize: 14 }}><strong>TP.HCM:</strong> 456 Trường Sa, Phú Nhuận</p>
      </div>
      <div>
        <h4 style={{ margin: '0 0 8px' }}>Kết nối</h4>
        <div style={{ display: 'flex', gap: 10, fontSize: 20 }}>
          <a href="#">👍</a>
          <a href="#">▶️</a>
          <a href="#">📸</a>
        </div>
      </div>
    </div>
    <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 16px', textAlign: 'center', fontSize: 14 }}>
      © 2025 GOFOODY. All rights reserved.
    </div>
  </footer>
);

export default Footer;
