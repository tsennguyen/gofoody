import type { ReviewDto } from '../../api/types';

interface ReviewItemProps {
  review: ReviewDto;
}

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString();
};

const renderStars = (rating: number): string => {
  const filled = '★'.repeat(Math.max(0, Math.min(5, rating)));
  const empty = '☆'.repeat(5 - filled.length);
  return filled + empty;
};

const ReviewItem = ({ review }: ReviewItemProps) => {
  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontWeight: 600 }}>{review.userName}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(review.createdAt)}</div>
      </div>
      <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 6 }}>
        {renderStars(review.rating)}{' '}
        <span style={{ color: '#111827', fontSize: 12 }}>{review.rating}/5</span>
      </div>
      {review.title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{review.title}</div>}
      {review.content && <p style={{ fontSize: 14, color: '#1f2937', margin: 0 }}>{review.content}</p>}
      {review.imageUrls && review.imageUrls.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {review.imageUrls.map((url) => (
            <img
              key={url}
              src={url}
              alt="Review"
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
