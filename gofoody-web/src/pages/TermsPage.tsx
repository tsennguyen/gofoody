const TermsPage = () => (
  <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Điều khoản sử dụng</h1>
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
      <h3>Chấp nhận điều khoản</h3>
      <p>Khi sử dụng website và đặt hàng, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
      <h3>Tài khoản & bảo mật</h3>
      <ul>
        <li>Giữ bí mật thông tin đăng nhập; chịu trách nhiệm cho mọi hoạt động trên tài khoản.</li>
        <li>Không giả mạo, xâm nhập, hoặc gây gián đoạn dịch vụ.</li>
      </ul>
      <h3>Đơn hàng & thanh toán</h3>
      <ul>
        <li>Giá, chương trình khuyến mại có thể thay đổi; đơn hàng chỉ xác nhận khi hệ thống ghi nhận thành công.</li>
        <li>GoFood/GoFoody có quyền từ chối/huỷ đơn trong trường hợp bất thường (thiếu hàng, sai giá, nghi ngờ gian lận...).</li>
      </ul>
      <h3>Nội dung & bản quyền</h3>
      <p>Hình ảnh, bài viết thuộc quyền sở hữu GoFoody; không sử dụng lại nếu chưa được đồng ý bằng văn bản.</p>
      <h3>Giới hạn trách nhiệm</h3>
      <p>GoFoody không chịu trách nhiệm cho thiệt hại phát sinh do sử dụng sai hướng dẫn hoặc sự cố ngoài tầm kiểm soát (thiên tai, gián đoạn mạng...).</p>
      <h3>Thay đổi điều khoản</h3>
      <p>Điều khoản có thể được cập nhật; khách hàng tiếp tục sử dụng dịch vụ đồng nghĩa chấp nhận phiên bản mới.</p>
    </div>
  </div>
);

export default TermsPage;
