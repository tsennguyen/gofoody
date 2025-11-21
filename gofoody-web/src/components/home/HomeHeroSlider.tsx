import { useEffect, useState, type CSSProperties } from 'react';

const slides = [
  'https://gofood.vn/upload/r/slider/gofood-nguyen-the-ruc-1.jpg',
  'https://gofood.vn/upload/r/slider/bo-my-3.jpg',
  'https://gofood.vn/upload/r/slider/mega-sale-2025-cao-la-trung-nhan-qua-cuc-khung-3.png',
  'https://gofood.vn/upload/r/slider/pre-order-mega-sale-2025-3.jpg',
  'https://gofood.vn/upload/r/slider/mega.png',
  'https://gofood.vn/upload/r/slider/banner-mat-ong-uc-pc.jpg',
];

const HomeHeroSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const next = () => setIndex((prev) => (prev + 1) % slides.length);

  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
      {slides.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="GOFOODY banner"
          style={{
            width: '100%',
            height: 420,
            objectFit: 'cover',
            display: i === index ? 'block' : 'none',
          }}
          loading="lazy"
        />
      ))}
      <button type="button" onClick={prev} style={navBtnStyle('left')}>
        ‹
      </button>
      <button type="button" onClick={next} style={navBtnStyle('right')}>
        ›
      </button>
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {slides.map((_, i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: i === index ? '#d11f28' : '#e5e7eb',
              border: '1px solid #fff',
            }}
          />
        ))}
      </div>
    </div>
  );
};

const navBtnStyle = (side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  top: '50%',
  [side]: 12,
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.35)',
  color: '#fff',
  border: 'none',
  width: 38,
  height: 38,
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: 22,
  display: 'grid',
  placeItems: 'center',
});

export default HomeHeroSlider;
