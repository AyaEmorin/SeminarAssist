<div align="center">

![Discord Suite Logo](file:///C:/Users/JuuFuuTeii/.gemini/antigravity/brain/26b36576-ba49-4ac6-a9cd-2a01613cc5ce/discord_suite_logo_1773487052637.png)

# ✨ Discord Suite Bot ✨
### ครบเครื่องเรื่อง Discord: ระบบเพลง, Dashboard และการจัดการนักศึกษา

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-blue)](https://discord.js.org/)
[![Framework](https://img.shields.io/badge/Framework-Vite%20%2B%20React-646CFF)](https://vitejs.dev/)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E)](https://supabase.com/)

---

**Discord Suite Bot** เป็นโปรเจกต์ที่รวมฟีเจอร์สำคัญสำหรับชุมชน Discord เข้าด้วยกันในหนึ่งเดียว ไม่ว่าจะเป็นระบบเพลงคุณภาพสูง, หน้า Dashboard สำหรับจัดการ Bot, และระบบลงทะเบียนที่เชื่อมต่อกับฐานข้อมูล Supabase

</div>

## 🚀 ฟีเจอร์หลัก (Core Features)

- 🎵 **ระบบเพลงคุณภาพสูง**: รองรับการเล่นเพลงผ่าน Lavalink พร้อมคำสั่งครบครัน (`/play`, `/skip`, `/stop`, `/queue`)
- 📊 **Web Dashboard**: หน้าสั่งการผ่านเว็บที่สร้างด้วย React 19 และ Vite สำหรับส่ง Embed และจัดการ Bot
- 📝 **ระบบลงทะเบียน**: ระบบลงทะเบียนนักศึกษาอัตโนมัติ พร้อมปุ่มโต้ตอบ เก็บข้อมูลเข้า Supabase
- ⚙️ **การจัดการอัตโนมัติ**: ระบบให้ Role อัตโนมัติ (Auto Role) และการควบคุมสมาชิกผ่าน AI
- 🛠️ **Dashboard สำหรับผู้บริหาร**: ส่งข้อความหน้าตาสวยงามไปยัง Channel ต่างๆ ได้ง่ายดาย

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| สิ่งที่ใช้ | เทคโนโลยี |
| :--- | :--- |
| **Language** | TypeScript (Strict Mode) |
| **Runtime** | Node.js v22+ |
| **Library** | Discord.js v14 |
| **Bot Engine** | Shoukaku (Lavalink Client) |
| **Frontend** | React 19, Vite, Tailwind CSS |
| **Backend** | Express.js |
| **Database** | Supabase (PostgreSQL) |

## ⚙️ การติดตั้งและเริ่มต้นใช้งาน (Installation)

### 1. เตรียมความพร้อม
ตรวจสอบให้แน่ใจว่าคุณติดตั้ง **Node.js v22** ขึ้นไป และมี **Lavalink Server** พร้อมใช้งาน

### 2. ตั้งค่าไฟล์ Environment
คัดลอกไฟล์ `.env.example` เป็น `.env` และกรอกข้อมูลให้ครบถ้วน:
```bash
cp .env.example .env
```

### 3. ติดตั้ง Dependencies
```bash
npm install
```

### 4. ลงทะเบียนคำสั่ง Slash Commands
เพื่อให้ Bot แสดงคำสั่งบน Discord ให้รันคำสั่งนี้:
```bash
npm run register:commands
```

### 5. เริ่มต้น Bot
**โหมด Developer:**
```bash
npm run dev
```

**โหมด Production:**
```bash
npm run build
npm start
```

## ⌨️ รายการคำสั่งบอท (Commands Reference)

| คำสั่ง | รายละเอียด |
| :--- | :--- |
| `/play <query>` | ค้นหาและเล่นเพลงในห้อง Voice Channel |
| `/skip` | ข้ามเพลงปัจจุบัน |
| `/stop` | หยุดเล่นเพลงและล้างคิวทั้งหมด |
| `/queue` | แสดงรายการเพลงในคิวปัจจุบัน |
| `/setup-registration` | ส่งหน้าจอลงทะเบียน (Embed + Button) |

---

## ☁️ การ Deploy
โปรเจกต์นี้ได้รับการออกแบบมาให้ Deploy ได้ง่ายผ่าน **Railway** หรือ Docker
- มีไฟล์ `railway.toml` และ `lavalink/railway.toml` รองรับการ Deploy แบบ Multi-service

---

<div align="center">
พัฒนาด้วย ❤️ โดยทีมพัฒนา Discord Suite
</div>

