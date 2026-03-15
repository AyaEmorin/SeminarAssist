# Discord Suite Bot

> ครบเครื่องเรื่อง Discord — ระบบเพลง, Web Dashboard ส่งประกาศ Embed, ลงทะเบียนนักศึกษา และอื่นๆ

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.12.0-brightgreen)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2)](https://discord.js.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E)](https://supabase.com/)

---

## ฟีเจอร์

### 🎵 ระบบเพลง
- เล่นเพลงจาก YouTube ผ่าน Lavalink + Shoukaku
- คิวเพลง, ข้ามเพลง, หยุดเพลง
- ปุ่มควบคุมแบบ Interactive Buttons ใน Discord
- รองรับทั้ง URL และคำค้นหา

### 📊 Web Dashboard
- หน้า Dashboard สำหรับส่งประกาศแบบ Embed ไปยังห้องต่างๆ
- **Mention Picker** — เลือก @ผู้ใช้ หรือ @ยศ จาก popup ค้นหาได้
- **Discord Preview** — ดูตัวอย่างข้อความก่อนส่ง เหมือน Discord จริง
- **Template System** — บันทึกฟอร์มเป็น template ไว้ใช้ซ้ำ เรียกใช้ได้จาก hotbar
- Login ผ่าน Discord OAuth (Supabase Auth)
- แสดงเฉพาะผู้ที่มีสิทธิ์ (ตาม Role/User ID ที่กำหนด)

### 📝 ระบบลงทะเบียน
- ลงทะเบียนนักศึกษาผ่านปุ่มใน Discord (Modal Form)
- เก็บข้อมูลเข้า Supabase (PostgreSQL)
- Auto Role หลังลงทะเบียนสำเร็จ

### 🧹 การจัดการห้อง
- ล้างประวัติแชททั้งห้อง หรือเฉพาะข้อความของบอท
- ป้องกันด้วยรหัสผ่าน

---

## Tech Stack

| หมวด | เทคโนโลยี |
|:---|:---|
| Language | TypeScript (Strict Mode) |
| Runtime | Node.js v22+ |
| Bot Library | Discord.js v14 |
| Music Engine | Shoukaku + Lavalink v4 |
| Frontend | React 19 + Vite 7 |
| Backend API | Express.js |
| Auth & DB | Supabase |

---

## การติดตั้ง

### ขั้นตอนที่ 1 — ติดตั้ง Dependencies

```bash
npm install
```

### ขั้นตอนที่ 2 — ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ แล้วกรอกค่าต่อไปนี้:

```env
# ─── Discord ───
DISCORD_CLIENT_ID=your_client_id
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id

# ─── Supabase ───
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ─── App URLs ───
APP_BASE_URL=http://localhost:5173
PUBLIC_URL=http://localhost:3000
PORT=3000

# ─── Auto Role ───
AUTO_ROLE_ID=role_id_for_registered_users

# ─── Dashboard Access Control ───
ALLOWED_ROLE_IDS=role_id_1,role_id_2
ALLOWED_USER_IDS=user_id_1,user_id_2

# ─── Lavalink (สำหรับระบบเพลง) ───
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass

# ─── Music ───
MUSIC_DEFAULT_VOLUME=0.2
```

### ขั้นตอนที่ 3 — เปิด Privileged Intents

ไปที่ [Discord Developer Portal](https://discord.com/developers/applications):

1. เลือก Bot ของคุณ → **Bot** → เลื่อนลงหา **Privileged Gateway Intents**
2. เปิด **Server Members Intent** ✅
3. กด **Save Changes**

### ขั้นตอนที่ 4 — ลงทะเบียน Slash Commands

```bash
npm run register:commands
```

### ขั้นตอนที่ 5 — เริ่มต้นใช้งาน

**Development** (hot-reload ทั้ง frontend + backend):
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## คำสั่งบอท (Slash Commands)

### 🎵 เพลง

| คำสั่ง | รายละเอียด |
|:---|:---|
| `/play <query>` | ค้นหาและเล่นเพลงจาก YouTube |
| `/skip` | ข้ามเพลงปัจจุบัน |
| `/stop` | หยุดเพลงและล้างคิวทั้งหมด |
| `/queue` | แสดงรายการคิวเพลง |
| `/join` | ให้บอทเข้ามาในห้องเสียง |
| `/leave` | ออกจากห้องเสียงและล้างคิว |

### 📝 ระบบลงทะเบียน

| คำสั่ง | รายละเอียด |
|:---|:---|
| `/setup-registration` | ส่ง Embed พร้อมปุ่มลงทะเบียน (Admin เท่านั้น) |

### 🧹 จัดการห้อง

| คำสั่ง | รายละเอียด |
|:---|:---|
| `/clean <password>` | ล้างประวัติแชททั้งหมดในห้อง |
| `/cleanself <password>` | ล้างเฉพาะข้อความของบอท |

---

## NPM Scripts

| Script | รายละเอียด |
|:---|:---|
| `npm run dev` | รัน frontend (Vite) + backend (tsx watch) พร้อมกัน |
| `npm run dev:web` | รันเฉพาะ frontend (Vite dev server) |
| `npm run dev:server` | รันเฉพาะ backend (tsx watch) |
| `npm run dev:lavalink` | รัน Lavalink server (ต้องมี Java) |
| `npm run build` | Build ทั้ง frontend + backend |
| `npm start` | รัน production server |
| `npm run register:commands` | ลงทะเบียน Slash Commands กับ Discord |

---

## โครงสร้างโปรเจกต์

```
discord-suite-bot/
├── src/
│   ├── client/               # React Frontend (Dashboard)
│   │   ├── components/       # EmbedForm, EmbedPreview, MentionPicker, TemplateBar, ...
│   │   ├── pages/            # DashboardPage, LoginPage, UnauthorizedPage
│   │   ├── lib/              # API client, Supabase client, Types
│   │   └── styles.css        # Global styles (Discord dark theme)
│   ├── server/               # Express Backend
│   │   ├── routes/           # API routes (discord, dashboard)
│   │   ├── services/         # Bot, Guild, Embed, Permission services
│   │   ├── middleware/       # Auth middleware
│   │   └── bot/              # Slash command & interaction handlers
│   ├── music/                # Music player logic
│   ├── lavalink/             # Lavalink client config
│   └── config/               # Lavalink config
├── scripts/
│   └── register-commands.ts  # Slash command registration
├── lavalink/                 # Lavalink server files
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## การใช้งาน Web Dashboard

1. เปิด `http://localhost:5173/` แล้ว **Login with Discord**
2. เลือก **ห้อง** ที่ต้องการส่งประกาศ
3. กรอก **หัวข้อ** และ **รายละเอียด**
4. เลือก **สี Embed**, ใส่ **รูปภาพ/Thumbnail** (ไม่บังคับ)
5. กดปุ่ม **@** เพื่อเลือก mention ผู้ใช้หรือยศ
6. ดู **ตัวอย่างก่อนส่ง** ทางด้านขวา
7. กด **💾 บันทึก** เพื่อเก็บเป็น template ไว้ใช้ซ้ำ
8. กด **📤 ส่งประกาศ**

---

## ข้อกำหนด

- **Node.js** ≥ 22.12.0
- **Java** 17+ (สำหรับ Lavalink)
- **Lavalink** v4 server (สำหรับระบบเพลง)
- **Supabase** project (สำหรับ Auth + Database)

---

<div align="center">
พัฒนาด้วย ❤️ โดยทีมพัฒนา Discord Suite
</div>
