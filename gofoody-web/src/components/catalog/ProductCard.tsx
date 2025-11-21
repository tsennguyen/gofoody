import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { ProductListItemDto } from '../../api/types';
import { calcDiscountPercent, formatVnCurrency } from '../../utils/format';

const fallbackImg = 'https://dummyimage.com/400x300/e5e7eb/374151.png&text=GOFOODY';

interface Props {
  product: ProductListItemDto;
  onAddToCart?: () => void;
}

const ProductCard = ({ product, onAddToCart }: Props) => {
  // Tạm tạo listPrice giả để hiển thị giảm giá giống Gofood
  const pretendListPrice = product.maxPrice && product.maxPrice > product.minPrice
    ? product.maxPrice
    : product.minPrice * 1.12;
  const discount = calcDiscountPercent(product.minPrice, pretendListPrice);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="card-hover"
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: 12,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        height: '100%',
        color: 'inherit',
        textDecoration: 'none',
        position: 'relative',
      }}
    >
      {discount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: '#d11f28',
            color: '#fff',
            padding: '4px 6px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Giảm -{discount}%
        </div>
      )}
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f3f4f6',
        }}
      >
        <img
          src={product.thumbnailUrl || fallbackImg}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{product.categoryName}</div>
      <div style={{ fontWeight: 700, color: '#111827', lineHeight: 1.4, minHeight: 40 }}>
        {product.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ color: '#d11f28', fontWeight: 800, fontSize: 16 }}>
          {formatVnCurrency(product.minPrice)}
          {product.maxPrice && product.maxPrice !== product.minPrice
            ? ` - ${formatVnCurrency(product.maxPrice)}`
            : ''}
        </div>
      </div>
      {pretendListPrice > product.minPrice && (
        <div style={{ color: '#888', fontSize: 13, textDecoration: 'line-through' }}>
          {formatVnCurrency(pretendListPrice)}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
        {product.isOrganic && <span style={chipStyle}>Organic</span>}
        {product.hasHaccpCert && <span style={chipStyle}>HACCP</span>}
        {product.requiresColdShipping && <span style={chipStyle}>Cold</span>}
        {product.isSeasonal && <span style={chipStyle}>Seasonal</span>}
      </div>
      {onAddToCart && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart();
          }}
          style={{
            marginTop: 8,
            borderRadius: 8,
            border: '1px solid #d11f28',
            background: '#d11f28',
            color: '#fff',
            padding: '10px 12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Thêm vào giỏ
        </button>
      )}
    </Link>
  );
};

const chipStyle: CSSProperties = {
  padding: '4px 8px',
  background: '#ecfdf3',
  color: '#15803d',
  borderRadius: 999,
  fontSize: 12,
  border: '1px solid #bbf7d0',
};

export default ProductCard;
