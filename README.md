<div align="center">

# ⚡ ACOUSTICFORGE TITANIUM
### Next-Gen Minecraft Client & Modpack Management Platform

[![Version](https://img.shields.io/badge/version-0.1.7-blue.svg?style=for-the-badge&logo=electron)](https://github.com/gbetokuon-stack/Launcher)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Electron](https://img.shields.io/badge/Electron-42-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![CurseForge](https://img.shields.io/badge/CurseForge-API-f16436?style=for-the-badge&logo=curseforge&logoColor=white)](https://curseforge.com/)
[![Modrinth](https://img.shields.io/badge/Modrinth-API-00AF5C?style=for-the-badge&logo=modrinth&logoColor=white)](https://modrinth.com/)

<p align="center">
  <b>AcousticForge Titanium</b> là trình khởi chạy Minecraft thế hệ mới với phong cách thiết kế <b>Cyberpunk Glassmorphism</b>, tích hợp sẵn kho mod CurseForge, Modrinth, trình đồng bộ modpack FTP máy chủ thời gian thực và mô hình 3D Skin tương tác.
</p>

---

</div>

## 🌌 Tính năng nổi bật

### 🎮 Quản lý phiên bản & Mod Loader toàn diện
- Hỗ trợ đầy đủ **Vanilla**, **Fabric**, **Forge**, **NeoForge**, và **Quilt**.
- Tự động phát hiện và cấu hình môi trường Java tương thích (Java 8, 17, 21+).
- Tùy chỉnh tham số khởi chạy JVM, RAM tối thiểu/tối đa, cờ tối ưu hóa Garbage Collector.

### 🌐 Kho Mods & Modpack Trực tuyến Tích Hợp
- **CurseForge & Modrinth**: Tìm kiếm, lọc theo Loader (Fabric/Forge/NeoForge/Quilt), phiên bản Minecraft và thể loại với tốc độ phản hồi cực nhanh.
- **Cài đặt 1-Click**: Tải và kích hoạt mod trực tiếp vào thư mục profile đang chọn mà không cần mở trình duyệt ngoài.
- Tự động bóc tách metadata file, phiên bản tương thích và icon hiển thị chất lượng cao.

### ⚡ Đồng bộ FTP Server Modpack độc quyền
- Kết nối trực tiếp máy chủ FTP của server Minecraft cộng đồng.
- Tự động kiểm tra mã hash, tải xuống các bản cập nhật mod, config, resourcepack mới nhất từ máy chủ.
- Tùy chọn **Clean Sync** dọn dẹp các tệp tin lỗi thời hoặc xung đột phiên bản.

### 🎭 3D Skin Viewer & Quản lý Tài khoản
- Trình hiển thị Skin 3D tương tác với **Three.js / React Three Fiber** hỗ trợ cả hai định dạng Classic (wide) và Slim (alex).
- Hỗ trợ tài khoản Ngoại tuyến (Offline sinh UUID chuẩn, tích hợp Custom Skin) & Microsoft OAuth2 bản quyền.

### 💎 Thiết kế Cyber Glassmorphic
- Hiệu ứng ánh sáng **Aurora Bloom** chuyển màu theo nền tảng (CurseForge cam lửa, Modrinth ngọc bích, FTP tím hoàng gia).
- Thẻ mods 3D chiều sâu với huy hiệu Loader phản quang.
- Bộ lọc dạng Segmented Floating Pills tiện lợi và hiện đại.
- Tích hợp Discord Rich Presence hiển thị trạng thái chơi game theo thời gian thực.

---

## 🛠️ Công nghệ sử dụng

- **Core Engine**: [Electron 42](https://www.electronjs.org/), [Node.js](https://nodejs.org/)
- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Giao diện**: [Tailwind CSS v4](https://tailwindcss.com/), [Phosphor Icons](https://phosphoricons.com/)
- **Đồ họa 3D**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Mạng & FTP**: [basic-ftp](https://github.com/patrickjuchli/basic-ftp), native HTTPS, [discord-rpc](https://github.com/discordjs/RPC)

---

## 🚀 Hướng dẫn Cài đặt & Phát triển

### Yêu cầu hệ thống
- **Node.js**: >= 20.x
- **Git**

### Cài đặt & Chạy Dev Mode
```bash
git clone https://github.com/gbetokuon-stack/Launcher.git
cd Launcher
npm install
npm run electron:dev
```

---

## 📦 Đóng gói Ứng dụng (Build)

Dự án được cấu hình sẵn với `electron-builder` để tạo cả file **Cài đặt (Installer Setup)** và **Bản chạy ngay không cần cài đặt (Portable)**:

```bash
npm run electron:build
```

Sau khi hoàn tất, các file thực thi sẽ được xuất tại thư mục `dist-electron/`:
- **AcousticForge-Setup-0.1.7.exe**: Bộ cài đặt NSIS tự động tạo shortcut Desktop & Start Menu.
- **AcousticForge-Portable-0.1.7.exe**: Phiên bản Portable xách tay, mở là chơi ngay.

---

## 👤 Tác giả

- **Phát triển bởi**: Acoustic & Gbetokuon
- **GitHub**: [@gbetokuon-stack](https://github.com/gbetokuon-stack)

---

<div align="center">
  <i>Được xây dựng với niềm đam mê dành cho cộng đồng Minecraft Việt Nam.</i>
</div>
