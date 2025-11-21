import { Link } from 'react-router-dom';
import type { CategoryDto } from '../../api/types';

interface Props {
  category: CategoryDto;
}

const CategoryCard = ({ category }: Props) => {
  return (
    <Link
      to={`/category/${category.slug}`}
      style={{
        display: 'block',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        textDecoration: 'none',
        color: '#111827',
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 120,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: '#16a34a',
          marginBottom: 12,
        }}
      >
        GOFOODY
      </div>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{category.name}</div>
      {category.description && (
        <div style={{ fontSize: 13, color: '#4b5563', marginTop: 6 }}>
          {category.description}
        </div>
      )}
    </Link>
  );
};

export default CategoryCard;
