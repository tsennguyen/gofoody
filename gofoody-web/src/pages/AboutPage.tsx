import { useMemo } from 'react';

const sections = [
  {
    title: 'Giới thiệu',
    image: 'https://gofood.vn/upload/r/banner_gioi_thieu.jpg',
    body: `Hệ thống cửa hàng thực phẩm nhập khẩu cao cấp Gofood thuộc công ty TNHH Thương mại quốc tế FBC
được thành lập từ năm 2016 với mong muốn là cầu nối giữa người tiêu dùng Việt tới các loại thực phẩm nhập khẩu từ các nền ẩm thực hàng đầu trên thế giới.`,
  },
  {
    title: 'Định hướng phát triển',
    image: 'https://gofood.vn/upload/r/footer/he-thong-gofood-7.jpg',
    body: `Gofood chọn lối đi riêng, trở thành hệ thống Butcher Shop hàng đầu Việt Nam, không ngừng phát triển sản phẩm,
dịch vụ và quy mô hệ thống để khẳng định vị thế trên thị trường.`,
  },
  {
    title: 'Không gian & trải nghiệm',
    image: 'https://gofood.vn/upload/r/footer/gofood-ham-nghi-40.jpg?1646791309653',
    body: `Gofood chú trọng trải nghiệm mua sắm: bố trí khoa học, ấn phẩm thông tin rõ ràng, dịch vụ chuyên sâu,
chương trình ưu đãi, tích điểm, phục vụ tận tâm.`,
  },
  {
    title: 'Sản phẩm & nguồn gốc',
    image: 'https://gofood.vn/upload/r/footer/gofood-2.jpg?1646791544285',
    body: `Đa dạng thực phẩm cao cấp: bò Mỹ Black Angus, bò Úc tươi, cá hồi Nauy, gan ngỗng Pháp, bò Kobe Nhật,
các sản phẩm độc quyền như cá hồi Nauy Organic, bò Wagyu Snake River Farms, bò Dry-Aged, cùng nhiều nguyên liệu tuyển chọn trong nước.`,
  },
  {
    title: 'Chứng nhận & cam kết',
    image: 'https://gofood.vn/upload/r/footer/chung-nhan-debio-ca-hoi-huu-co-2021.jpg?1647396711414',
    body: `Tất cả sản phẩm đều có chứng nhận chất lượng (USDA, Global GAP, DEBIO...). Gofood cam kết quy trình nhập khẩu, sơ chế, bảo quản khép kín,
chỉ phân phối hàng chính hãng, nguồn gốc rõ ràng.`,
  },
  {
    title: 'Trải nghiệm mua sắm chuyên sâu',
    image: 'https://gofood.vn/upload/r/footer/gofood-ham-nghi-67.jpg?1647396947236',
    body: `Không gian tinh tế, dịch vụ chuyên biệt, đội ngũ sẵn sàng tư vấn, hướng dẫn chế biến.
Mục tiêu trở thành điểm đến tin cậy cho nguyên liệu món ngon và Butcher Shop hàng đầu.`,
  },
];

const AboutPage = () => {
  const youtubeUrl = useMemo(() => 'https://youtu.be/trHwoHLsPZE', []);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#d11f28' }}>Giới thiệu GOFOODY</h1>
      {sections.map((s) => (
        <section
          key={s.title}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 320px) 1fr',
            gap: 16,
            alignItems: 'center',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 12,
          }}
        >
          <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden' }}>
            <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>{s.title}</h2>
            <p style={{ margin: 0, whiteSpace: 'pre-line', color: '#111827', lineHeight: 1.6 }}>{s.body}</p>
          </div>
        </section>
      ))}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>Video giới thiệu</h2>
        <a href={youtubeUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>
          Xem video: Không gian mua sắm tại Gofood
        </a>
      </div>
    </div>
  );
};

export default AboutPage;
