<<<<<<< HEAD
# gofoody_project
Food delivery management system backend (orders, products, delivery, revenue dashboard)
=======
# GOFOODY — Fullstack Demo Project

Đây là bản sao mã nguồn hoàn chỉnh của dự án GOFOODY (backend .NET 8 Web API + frontend React + SQL Server). Tài liệu dưới đây mô tả cấu trúc thư mục, các tính năng đã hoàn thiện, và hướng dẫn nhanh để chạy dự án ở môi trường phát triển.

## Cấu trúc thư mục
# GOFOODY — Fullstack Demo Project

Đây là bản sao mã nguồn hoàn chỉnh của dự án GOFOODY (backend .NET 8 Web API + frontend React + SQL Server). Tài liệu dưới đây mô tả cấu trúc thư mục, các tính năng đã hoàn thiện, và hướng dẫn nhanh để chạy dự án ở môi trường phát triển.

## Cấu trúc thư mục

gofoody_project/
├── backend/
│   ├── GoFoody.Api/
│   ├── GoFoody.Infrastructure/
│   ├── GoFoody.Domain/
│   ├── GoFoody.sln
│   ├── appsettings.json.example
│   └── README_BACKEND.md
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── README_FRONTEND.md
├── README.md
├── .gitignore
├── .gitattributes
└── docs/


## Những tính năng đã hoàn thành

1) Backend (.NET 8 + EF Core + SQL Server)
- Xác thực & phân quyền (JWT, Roles: CUSTOMER, ADMIN).
- Quản lý danh mục, sản phẩm, biến thể, tồn kho.
- Giỏ hàng, thanh toán, đặt hàng & quản lý trạng thái đơn.
- Admin panel: quản lý người dùng, sản phẩm, danh mục, phương thức giao hàng.
- Lịch sử đơn hàng cho khách hàng.
- Dashboard doanh thu (báo cáo ngày/tháng).
- Search nâng cao (name, ingredients, tags như "ăn kiêng", "eat clean").
- Gợi ý thông minh: "có thể bạn muốn tìm...", "frequently bought together", gợi ý cá nhân.

2) Frontend (React + TypeScript + Vite)
- Trang Home, Category, Product detail, Search nâng cao.
- Giỏ hàng, thanh toán, lịch sử đơn hàng.
- Login/Register + redirect theo role (Customer/Admin).
- Admin panel với chức năng quản lý chính.
- Gợi ý combo & cá nhân hoá.

3) Database (SQL Server)
- Schema chính: GoFoodyDB.
- Bảng chính: Users, Roles, Categories, Products, ProductVariants, Orders, OrderItems, Tags, ProductTags, Vouchers, Banners, Posts, Notifications, Addresses, …
- Migration & Seed tự động khi khởi tạo project lần đầu.


## Hướng dẫn chạy nhanh (Development)

1) Cấu hình Database

- Cài SQL Server 2019+ (hoặc Azure SQL).
- Tạo database trống tên `GoFoodyDB`.
- Không import file `.sql` — dự án có seed tự động.
- File cấu hình backend mẫu: `backend/GoFoody.Api/appsettings.json.example` — copy thành `appsettings.json` và chỉnh chuỗi kết nối.

Ví dụ connection string:

```
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=GoFoodyDB;User Id=sa;Password=your_password;TrustServerCertificate=True;"
}
```

2) Chạy Backend (.NET 8)

```
cd backend
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

Mặc định API chạy tại `https://localhost:5001` hoặc `http://localhost:5000`.

Health check: GET /api/health → 200 OK

3) Chạy Frontend (React + Vite)

```
cd frontend
npm install
npm run dev
```

Frontend mặc định: http://localhost:5173

Chỉnh API URL trong `.env` hoặc `.env.example`:

```
VITE_API_BASE_URL=http://localhost:5000
```






## Commit message đề xuất

```
feat: khởi tạo và hoàn thiện hệ thống GOFOODY fullstack
- Thêm backend .NET 8 Web API + EF Core
- Thêm frontend React + TS + Vite
- Thêm README hướng dẫn chạy project
- Bỏ qua file .sql và file cấu hình nhạy cảm
```

---
