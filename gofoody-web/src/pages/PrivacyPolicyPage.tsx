const PrivacyPolicyPage = () => (
  <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Chính sách bảo mật</h1>
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
      <h3>Thu thập thông tin</h3>
      <p>Chúng tôi thu thập thông tin tài khoản, lịch sử mua, địa chỉ giao hàng, và thông tin kỹ thuật (IP, user-agent) để phục vụ giao dịch.</p>
      <h3>Mục đích sử dụng</h3>
      <ul>
        <li>Xử lý đơn hàng, giao nhận, chăm sóc khách hàng.</li>
        <li>Cá nhân hóa trải nghiệm (gợi ý sản phẩm, ưu đãi).</li>
        <li>Đảm bảo an toàn, chống gian lận.</li>
      </ul>
      <h3>Chia sẻ thông tin</h3>
      <p>Chỉ chia sẻ với đơn vị giao nhận, thanh toán hoặc cơ quan quản lý khi có yêu cầu hợp pháp. Không bán/chuyển nhượng thông tin cho bên thứ ba trái phép.</p>
      <h3>Bảo mật & lưu trữ</h3>
      <p>Dữ liệu được lưu trữ an toàn, phân quyền truy cập; thông tin thẻ thanh toán tuân thủ tiêu chuẩn của cổng thanh toán đối tác.</p>
      <h3>Quyền của khách hàng</h3>
      <p>Bạn có quyền xem, chỉnh sửa, yêu cầu xóa dữ liệu cá nhân (trừ dữ liệu phải lưu theo quy định pháp luật).</p>
    </div>
  </div>
);

export default PrivacyPolicyPage;
