import type { CSSProperties } from 'react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: Props) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
      <button
        onClick={handlePrev}
        disabled={page <= 1}
        style={buttonStyle}
      >
        Previous
      </button>
      <div style={{ fontSize: 14 }}>
        Page {page} / {totalPages}
      </div>
      <button
        onClick={handleNext}
        disabled={page >= totalPages}
        style={buttonStyle}
      >
        Next
      </button>
    </div>
  );
};

const buttonStyle: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
};

export default Pagination;
