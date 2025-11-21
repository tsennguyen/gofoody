const ShippingPolicyPage = () => (
  <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Chính sách giao hàng</h1>
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
      <h3>Phạm vi & thời gian giao</h3>
      <ul>
        <li>Hà Nội, TP.HCM: giao trong ngày hoặc theo khung giờ đăng ký.</li>
        <li>Tỉnh thành khác: giao qua đối tác vận chuyển, thời gian 1-4 ngày tùy khu vực.</li>
      </ul>
      <h3>Phí giao hàng</h3>
      <ul>
        <li>Tiêu chuẩn: theo bảng giá hệ thống, miễn/giảm phí theo chương trình khuyến mại.</li>
        <li>Hàng lạnh: áp dụng phụ phí bảo quản lạnh (nếu có), hiển thị khi đặt hàng.</li>
      </ul>
      <h3>Đóng gói & bảo quản</h3>
      <ul>
        <li>Đóng gói cách nhiệt, kèm đá gel/đá khô với sản phẩm đông lạnh.</li>
        <li>Nhãn sản phẩm đầy đủ thông tin nguồn gốc, hạn dùng, hướng dẫn bảo quản.</li>
      </ul>
      <h3>Kiểm hàng & đổi trả</h3>
      <ul>
        <li>Quý khách kiểm hàng khi nhận; nếu có vấn đề hư hỏng/rò rỉ hãy báo ngay với CSKH.</li>
        <li>Sản phẩm lỗi do vận chuyển/bảo quản được đổi mới hoặc hoàn tiền theo quy định.</li>
      </ul>
    </div>
  </div>
);

export default ShippingPolicyPage;
