# Backend — GoFoody (README)

Hướng dẫn chạy và cấu hình backend (.NET 8 Web API).

- Mẫu cấu hình: `appsettings.json.example` — copy thành `appsettings.json` và chỉnh chuỗi kết nối.
- Các lệnh chính:

```
cd backend
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

Để chạy seed:

```
dotnet run -- --seed
```
