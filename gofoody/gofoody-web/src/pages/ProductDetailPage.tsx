import { useEffect, useState } from 'react';
import { useCart } from '../cart/CartContext';
import type { CSSProperties } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductDetail } from '../api/productApi';
import { createReview, getReviews } from '../api/reviewApi';
import { getFrequentlyBoughtTogether } from '../api/recommendationApi';
import { useAuth } from '../auth/AuthContext';
import type {
  ProductDetailDto,
  ProductVariantDto,
  ReviewDto,
  ProductRecommendationItemDto,
} from '../api/types';
import ReviewItem from '../components/reviews/ReviewItem';

const fallbackImage = 'https://via.placeholder.com/600x400.png?text=GOFOODY+PRODUCT';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { isAuthenticated, isCustomer, user } = useAuth();

  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewImageUrlsText, setReviewImageUrlsText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [comboItems, setComboItems] = useState<ProductRecommendationItemDto[]>([]);
  const [loadingCombo, setLoadingCombo] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoadingProduct(true);
    setProductError(null);
    getProductDetail(slug)
      .then((data) => {
        setProduct(data);
        const firstVariant = data.variants[0] ?? null;
        setSelectedVariant(firstVariant);
        const firstImage = data.images[0]?.imageUrl ?? null;
        setSelectedImage(firstImage);
        setReviewsPage(1);
      })
      .catch((err) => {
        console.error(err);
        setProductError('Không tải được thông tin sản phẩm.');
      })
      .finally(() => setLoadingProduct(false));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    setLoadingCombo(true);
    getFrequentlyBoughtTogether(product.id)
      .then((res) => setComboItems(res.items))
      .catch(() => setComboItems([]))
      .finally(() => setLoadingCombo(false));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const load = async () => {
      setLoadingReviews(true);
      try {
        const result = await getReviews(product.id, reviewsPage, 5);
        setReviews(result.items);
        setReviewsTotalPages(result.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReviews(false);
      }
    };
    load();
  }, [product, reviewsPage]);

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string) || '');
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );
    try {
      const base64List = await Promise.all(readers);
      setUploadedImages(base64List);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVariantChange = (variantId: number) => {
    if (!product) return;
    const found = product.variants.find((v) => v.id === variantId) ?? null;
    setSelectedVariant(found);
  };

  const handleQuantityChange = (value: number) => {
    if (!selectedVariant) {
      setQuantity(1);
      return;
    }
    const min = selectedVariant.minOrderQuantity ?? 1;
    const max = selectedVariant.maxOrderQuantity ?? 99;
    const q = Math.min(Math.max(value, min), max);
    setQuantity(q);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItem(selectedVariant.id, quantity)
      .then(() => alert('Đã thêm vào giỏ hàng.'))
      .catch(() => alert('Không thêm được vào giỏ hàng.'));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated || !isCustomer) {
      setReviewError('Vui lòng đăng nhập để đánh giá.');
      return;
    }
    setReviewError(null);

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Điểm đánh giá phải từ 1 đến 5.');
      return;
    }
    if (!reviewContent.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    const imageUrls = reviewImageUrlsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const mergedImages = [...imageUrls, ...uploadedImages].filter((s) => s.length > 0);

    setSubmittingReview(true);
    try {
      await createReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle || undefined,
        content: reviewContent,
        imageUrls: mergedImages.length > 0 ? mergedImages : undefined,
      });

      setReviewTitle('');
      setReviewContent('');
      setReviewImageUrlsText('');
      setReviewRating(5);
      setUploadedImages([]);

      setReviewsPage(1);
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setReviewError('Vui lòng đăng nhập bằng tài khoản khách hàng để đánh giá.');
      } else if (err?.response?.data) {
        const resp = err.response.data;
        setReviewError(typeof resp === 'string' ? resp : 'Gửi đánh giá thất bại. Vui lòng thử lại.');
      } else {
        setReviewError('Gửi đánh giá thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loadingProduct) {
    return <div style={{ padding: 16 }}>Đang tải sản phẩm...</div>;
  }

  if (productError) {
    return <div style={{ padding: 16, color: '#dc2626' }}>{productError}</div>;
  }

  if (!product) {
    return <div style={{ padding: 16 }}>Không tìm thấy sản phẩm.</div>;
  }

  const priceText =
    product.maxPrice && product.maxPrice !== product.minPrice
      ? `${product.minPrice.toLocaleString()} - ${product.maxPrice.toLocaleString()} đ`
      : `${product.minPrice.toLocaleString()} đ`;

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr', marginBottom: 32 }}>
        <div>
          <div style={{ width: '100%', height: 320, background: '#f3f4f6', marginBottom: 12 }}>
            <img
              src={selectedImage || product.images[0]?.imageUrl || fallbackImage}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.imageUrl)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: selectedImage === img.imageUrl ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    padding: 0,
                    background: '#fff',
                  }}
                >
                  <img
                    src={img.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{product.categoryName}</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{product.name}</h1>
          <div style={{ fontSize: 20, color: '#dc2626', fontWeight: 700, margin: '8px 0 12px' }}>
            {priceText}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, fontSize: 12 }}>
            {product.isOrganic && <span style={chipStyle('#16a34a', '#bbf7d0')}>Organic</span>}
            {product.hasHaccpCert && <span style={chipStyle('#2563eb', '#bfdbfe')}>HACCP</span>}
            {product.isSeasonal && <span style={chipStyle('#f97316', '#fed7aa')}>Theo mùa</span>}
            {product.variants.some((v) => v.requiresColdShipping) && (
              <span style={chipStyle('#0ea5e9', '#bae6fd')}>Giao hàng lạnh</span>
            )}
          </div>

          <div style={{ fontSize: 14, marginBottom: 8 }}>
            {product.originCountry && (
              <div>
                <strong>Xuất xứ: </strong>
                {product.originCountry}
              </div>
            )}
            {product.brand && (
              <div>
                <strong>Thương hiệu: </strong>
                {product.brand}
              </div>
            )}
            {product.storageCondition && (
              <div>
                <strong>Bảo quản: </strong>
                {product.storageCondition}
                {product.storageTempMin != null && product.storageTempMax != null && (
                  <> ({product.storageTempMin}°C - {product.storageTempMax}°C)</>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Chọn loại:</label>
            <select
              value={selectedVariant?.id ?? ''}
              onChange={(e) => handleVariantChange(Number(e.target.value))}
              style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', minWidth: 240 }}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.price.toLocaleString()} đ
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Số lượng:</label>
              <input
                type="number"
                value={quantity}
                min={selectedVariant?.minOrderQuantity ?? 1}
                max={selectedVariant?.maxOrderQuantity ?? 99}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: 100 }}
              />
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                background: '#dc2626',
                color: '#fff',
                padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            marginTop: 16,
          }}
        >
          Thêm vào giỏ
        </button>
          </div>

          {product.shortDescription && (
            <p style={{ fontSize: 14, color: '#1f2937', marginTop: 0 }}>{product.shortDescription}</p>
          )}
        </div>
      </div>

      {product.description && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Mô tả chi tiết</h2>
          <div style={{ fontSize: 14, color: '#1f2937', whiteSpace: 'pre-line' }}>{product.description}</div>
        </div>
      )}

      {!loadingCombo && comboItems.length > 0 && (
        <section style={{ marginTop: 24, marginBottom: 24 }}>
          <h2 style={{ marginBottom: 12 }}>Thường được mua kèm</h2>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {comboItems.map((p) => (
              <Link
                key={p.productId}
                to={`/product/${p.slug}`}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 10,
                  padding: 12,
                  textDecoration: 'none',
                  color: '#111827',
                }}
              >
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{p.categoryName}</div>
                <div style={{ color: '#d11f28', fontWeight: 800, marginTop: 4 }}>
                  {p.minPrice.toLocaleString('vi-VN')} đ
                </div>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>{p.reason}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: '2fr 1fr' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Đánh giá sản phẩm</h2>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {product.reviewSummary.totalReviews > 0
                ? `${product.reviewSummary.averageRating.toFixed(1)}/5 từ ${product.reviewSummary.totalReviews} đánh giá`
                : 'Chưa có đánh giá nào'}
            </div>
          </div>

          {loadingReviews && <div style={{ fontSize: 14 }}>Đang tải đánh giá...</div>}
          {!loadingReviews && reviews.length === 0 && (
            <div style={{ fontSize: 14, color: '#6b7280' }}>Chưa có đánh giá, hãy là người đầu tiên.</div>
          )}
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} />
          ))}

          {reviewsTotalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setReviewsPage((p) => Math.max(p - 1, 1))}
                disabled={reviewsPage <= 1}
                style={pagerButtonStyle(reviewsPage <= 1)}
              >
                Trang trước
              </button>
              <span style={{ fontSize: 14 }}>
                {reviewsPage}/{reviewsTotalPages}
              </span>
              <button
                type="button"
                onClick={() => setReviewsPage((p) => Math.min(p + 1, reviewsTotalPages))}
                disabled={reviewsPage >= reviewsTotalPages}
                style={pagerButtonStyle(reviewsPage >= reviewsTotalPages)}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>Viết đánh giá</h3>
          {(!isAuthenticated || !isCustomer) ? (
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              Vui lòng <Link to="/login">đăng nhập</Link> để đánh giá sản phẩm.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <span>Chọn sao:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 20,
                      color: star <= reviewRating ? '#f59e0b' : '#d1d5db',
                    }}
                    aria-label={`Chọn ${star} sao`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ fontSize: 12, color: '#6b7280' }}>({reviewRating}/5)</span>
              </div>
              <label style={labelStyle}>
                Tiêu đề:
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Nội dung:
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                />
              </label>
            <label style={labelStyle}>
              Link ảnh (cách nhau bởi dấu phẩy):
              <textarea
                value={reviewImageUrlsText}
                onChange={(e) => setReviewImageUrlsText(e.target.value)}
                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              />
            </label>
              <label style={labelStyle}>
                Hoặc tải ảnh:
                <input type="file" accept="image/*" multiple onChange={handleUploadChange} />
                {uploadedImages.length > 0 && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    Đã chọn {uploadedImages.length} ảnh (sẽ gửi dạng base64).
                  </div>
                )}
              </label>
              {reviewError && <div style={{ color: '#dc2626', fontSize: 12 }}>{reviewError}</div>}
              <button
                type="submit"
                disabled={submittingReview}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  opacity: submittingReview ? 0.7 : 1,
                }}
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const chipStyle = (color: string, bg: string): CSSProperties => ({
  padding: '6px 10px',
  borderRadius: 999,
  border: `1px solid ${bg}`,
  color,
  background: bg,
});

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 14,
  color: '#111827',
};

const inputStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  fontSize: 14,
};

const pagerButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: disabled ? '#f3f4f6' : '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

export default ProductDetailPage;
