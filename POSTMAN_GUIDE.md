# 📮 Postman Collection Guide

## 🚀 Quick Setup

### 1. Import Collection
1. Buka Postman
2. Klik **Import** di pojok kiri atas
3. Drag & drop file `postman-collection.json` atau klik **Upload Files**
4. Collection akan muncul di sidebar kiri

### 2. Import Environment (Optional)
1. Klik **Import** lagi
2. Import file `postman-environment.json`
3. Pilih environment "Express JWT Environment" di dropdown kanan atas

### 3. Set Base URL
- Pastikan variable `baseUrl` di collection settings atau environment sudah benar
- Default: `http://localhost:5000`

## 📁 Collection Structure

### 🔐 Authentication
- **Register User** - Daftar user baru
- **Login User** - Login dan dapatkan access token
- **Refresh Token** - Perbarui access token
- **Get Current User** - Info user yang sedang login
- **Logout (Single Device)** - Logout dari device saat ini
- **Logout All Devices** - Logout dari semua device

### 👤 User Management
- **Get User Profile** - Lihat profil user
- **Update User Profile** - Update profil user
- **Change Password** - Ganti password
- **Deactivate Account** - Nonaktifkan akun

### 👑 Admin Operations
- **Get All Users** - Lihat semua user (Admin only)
- **Update User Role** - Ubah role user (Admin only)

### 🔒 Protected Routes
- **User Protected Route** - Route untuk user yang login
- **Admin Protected Route** - Route khusus admin
- **Moderator Protected Route** - Route untuk moderator & admin
- **Optional Auth Route** - Route dengan auth opsional

### 🏥 System
- **Health Check** - Cek status server

## 🔧 How to Use

### Step 1: Register & Login
1. Jalankan **Register User** dengan data:
   ```json
   {
     "username": "johndoe",
     "email": "john@example.com", 
     "password": "Password123",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. Atau langsung **Login User** jika sudah punya akun:
   ```json
   {
     "email": "john@example.com",
     "password": "Password123"
   }
   ```

3. Access token akan otomatis tersimpan di variable `{{accessToken}}`

### Step 2: Test Protected Routes
- Semua request yang butuh authentication sudah menggunakan `{{accessToken}}`
- Token akan otomatis dimasukkan ke header `Authorization: Bearer {{accessToken}}`

### Step 3: Admin Testing
1. Untuk test admin routes, buat user dengan role admin di database
2. Atau gunakan endpoint **Update User Role** (butuh akses admin)

## 🔄 Auto Token Management

Collection ini sudah dilengkapi dengan script otomatis:

### Register/Login Response Handler
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.accessToken) {
        pm.collectionVariables.set('accessToken', response.data.accessToken);
        pm.collectionVariables.set('userId', response.data.user._id);
    }
}
```

### Refresh Token Handler
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.accessToken) {
        pm.collectionVariables.set('accessToken', response.data.accessToken);
    }
}
```

## 🎯 Testing Scenarios

### Scenario 1: Complete User Journey
1. **Register User** → Auto save token
2. **Get User Profile** → Verify user data
3. **Update User Profile** → Change name
4. **Change Password** → Update security
5. **Logout** → Clear session

### Scenario 2: Admin Operations
1. **Login** as admin
2. **Get All Users** → See all users with pagination
3. **Update User Role** → Promote user to moderator
4. **Admin Protected Route** → Access admin-only content

### Scenario 3: Token Management
1. **Login** → Get fresh tokens
2. **Refresh Token** → Get new access token
3. **Logout All Devices** → Clear all sessions

## 🔍 Query Parameters

### Get All Users
- `page` - Nomor halaman (default: 1)
- `limit` - Jumlah user per halaman (default: 10)  
- `search` - Cari berdasarkan username, email, firstName, lastName
- `role` - Filter berdasarkan role (user, admin, moderator)
- `isActive` - Filter berdasarkan status aktif (true/false)

Contoh:
```
GET /api/users?page=2&limit=5&search=john&role=user&isActive=true
```

## 🛡️ Security Features

### Rate Limiting
- Server membatasi 100 request per 15 menit per IP
- Jika kena limit, tunggu beberapa menit

### Token Expiration
- Access token: 15 menit
- Refresh token: 7 hari
- Gunakan **Refresh Token** jika access token expired

### Cookie-based Refresh Token
- Refresh token disimpan di HTTP-only cookie
- Otomatis dikirim dengan setiap request
- Lebih aman dari XSS attacks

## 🐛 Troubleshooting

### Error 401 - Unauthorized
- Token expired → Gunakan **Refresh Token**
- Token invalid → **Login** ulang
- No token → Pastikan sudah login

### Error 403 - Forbidden  
- Insufficient permissions → Butuh role yang lebih tinggi
- Admin routes → Butuh role 'admin'
- Moderator routes → Butuh role 'moderator' atau 'admin'

### Error 409 - Conflict
- Email/username sudah ada → Gunakan data yang berbeda
- Duplicate entry → Cek data yang dikirim

### Error 500 - Server Error
- Database connection → Pastikan MongoDB running
- Server down → Cek apakah server berjalan di port 5000

## 📝 Notes

1. **Environment Variables**: Pastikan server sudah setup dengan `.env` file yang benar
2. **MongoDB**: Pastikan MongoDB service berjalan
3. **CORS**: Server sudah dikonfigurasi untuk menerima request dari Postman
4. **Cookies**: Postman otomatis handle cookies untuk refresh token
5. **Variables**: Collection menggunakan variables untuk token management

## 🎉 Happy Testing!

Collection ini sudah siap pakai dan terorganisir dengan baik. Semua endpoint sudah ditest dan dilengkapi dengan contoh data yang valid. Selamat testing! 🚀