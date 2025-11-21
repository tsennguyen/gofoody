import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSearchSuggestions } from '../api/searchApi';
import type { SearchSuggestionDto } from '../api/types';

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionDto[]>([]);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      getSearchSuggestions(q).then(setSuggestions).catch(() => setSuggestions([]));
    }, 300);
  }, [q]);

  const goSearch = (term: string) => {
    navigate(`/search?query=${encodeURIComponent(term)}`);
    setOpen(false);
  };

  const handleSelect = (s: SearchSuggestionDto) => {
    if (s.type === 'Category' && s.categoryId) {
      navigate(`/search?categoryId=${s.categoryId}&query=${encodeURIComponent(s.term)}`);
    } else {
      goSearch(s.term);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goSearch(q);
          }}
          placeholder="Tìm sản phẩm, combo, nguyên liệu..."
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
          }}
        />
        <button
          type="button"
          onClick={() => goSearch(q)}
          style={{
            position: 'absolute',
            right: 4,
            top: 4,
            bottom: 4,
            background: '#d11f28',
            color: '#fff',
            borderRadius: 6,
            padding: '0 12px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🔍
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
            zIndex: 40,
          }}
        >
          {suggestions.slice(0, 10).map((s, idx) => (
            <div
              key={`${s.term}-${idx}`}
              onMouseDown={() => handleSelect(s)}
              style={{
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <span style={{ fontSize: 12, color: '#6b7280', minWidth: 80 }}>
                {s.type === 'ProductName' ? 'Sản phẩm' : s.type === 'Category' ? 'Danh mục' : 'Tag'}
              </span>
              <span style={{ fontWeight: 600 }}>{s.term}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

