Dưới đây là bộ case test nhanh (Postman/curl) cho các API admin/khách. Luôn thêm header Authorization: Bearer <token> (token ADMIN cho nhóm /api/admin/...; token CUSTOMER cho /api/orders/my).

Khách hàng

List đơn của tôi:
GET http://localhost:5000/api/orders/my?page=1&pageSize=5
Chi tiết đơn:
GET http://localhost:5000/api/orders/my/{orderCode}
Admin – Categories

List (filter keyword/isActive):
GET http://localhost:5000/api/admin/categories?page=1&pageSize=20&keyword=thit&isActive=true
Detail:
GET http://localhost:5000/api/admin/categories/1
Tạo:
POST http://localhost:5000/api/admin/categories
{"name":"Đồ khô","slug":null,"description":"Hàng khô","parentId":null,"isActive":true,"sortOrder":5}
Cập nhật:
PUT http://localhost:5000/api/admin/categories/1
{"name":"Đồ khô","slug":"do-kho","description":"Hàng khô","parentId":null,"isActive":true,"sortOrder":5}
Soft delete:
DELETE http://localhost:5000/api/admin/categories/1
Admin – Products

List (filter keyword/category/isActive):
GET http://localhost:5000/api/admin/products?page=1&pageSize=20&keyword=ca&categoryId=1&isActive=true
Detail:
GET http://localhost:5000/api/admin/products/1
Tạo:
POST http://localhost:5000/api/admin/products
{
  "name":"Cá hồi Nauy 500g",
  "slug": null,
  "categoryId":1,
  "shortDescription":"Phi lê",
  "description":"Cá hồi tươi",
  "originCountry":"Norway",
  "brand":"GOFOODY",
  "isOrganic":false,
  "hasHaccpCert":true,
  "isSeasonal":false,
  "storageCondition":"Bảo quản lạnh",
  "storageTempMin":-18,
  "storageTempMax":-12,
  "isActive":true,
  "variants":[{"id":null,"name":"500g","unit":"Gram","weightGrams":500,"price":350000,"listPrice":380000,"isFresh":false,"isFrozen":true,"isPrecut":false,"requiresColdShipping":true,"stockQuantity":50,"minOrderQuantity":1,"maxOrderQuantity":10,"isActive":true}],
  "images":[{"id":null,"imageUrl":"https://example.com/img.jpg","isDefault":true,"sortOrder":0}]
}
Cập nhật (upsert variant/image, variant vắng sẽ status=0):
PUT http://localhost:5000/api/admin/products/1 (body giống POST nhưng có id cho variant/image cần giữ)
Soft delete:
DELETE http://localhost:5000/api/admin/products/1
Admin – Users

List (filter keyword/role/isActive):
GET http://localhost:5000/api/admin/users?page=1&pageSize=20&keyword=admin&role=ADMIN&isActive=true
Detail:
GET http://localhost:5000/api/admin/users/4
Cập nhật (FullName/Phone/Status + Roles):
PUT http://localhost:5000/api/admin/users/4
{"fullName":"Admin User","phone":"0900000000","isActive":true,"roleCodes":["ADMIN","CUSTOMER"]}
Admin – ShippingMethods

List:
GET http://localhost:5000/api/admin/shipping-methods?isActive=true
Detail:
GET http://localhost:5000/api/admin/shipping-methods/1
Tạo:
POST http://localhost:5000/api/admin/shipping-methods
{"code":"FAST3H","name":"Giao nhanh 3h","description":"Nội thành","isColdShipping":false,"baseFee":40000,"isActive":true,"sortOrder":2}
Cập nhật:
PUT http://localhost:5000/api/admin/shipping-methods/1
{"code":"FAST3H","name":"Giao nhanh 3 giờ","description":"Nội thành","isColdShipping":false,"baseFee":45000,"isActive":true,"sortOrder":2}
Soft delete:
DELETE http://localhost:5000/api/admin/shipping-methods/1
Admin – Orders (nhắc lại)

List:
GET http://localhost:5000/api/admin/orders?page=1&pageSize=20&status=0&paymentStatus=0
status: 0..4 (Pending, Confirmed, Shipping, Completed, Cancelled)
paymentStatus: 0..2 (Unpaid, Paid, Refunded)
Detail:
GET http://localhost:5000/api/admin/orders/123
Detail theo code:
GET http://localhost:5000/api/admin/orders/code/GOF...
Cập nhật trạng thái:
PUT http://localhost:5000/api/admin/orders/123/status
{"status":1,"paymentStatus":0}
Hoặc theo code:
PUT http://localhost:5000/api/admin/orders/code/GOF.../status (body như trên)
Stats:
GET http://localhost:5000/api/admin/orders/stats?fromDate=2025-01-01&toDate=2025-12-31
Lưu ý

Các param enum cho admin orders trong backend nhận số (0..4, 0..2).
Mọi request admin cần token ADMIN; khách dùng token CUSTOMER cho /api/orders/my/....