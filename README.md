# Discord Suite Bot

รวมระบบ Discord bot, หน้า dashboard สำหรับส่ง embed, ระบบลงทะเบียนนักศึกษา, และคำสั่งเพลงพื้นฐานในโปรเจกต์เดียว

## การติดตั้ง
1. คัดลอก `.env.example` เป็น `.env`
2. กรอกค่า env ให้ครบ
3. รัน `npm install`
4. รัน `npm run register:commands`
5. รัน `npm run dev`

## คำสั่งหลัก
- `/setup-registration` ส่ง embed + ปุ่มลงทะเบียน
- `/play <url-or-query>` เล่นเพลงใน voice channel เดียวกับผู้ใช้
- `/skip` ข้ามเพลง
- `/stop` หยุดเพลงและล้างคิว
- `/queue` ดูคิวเพลง

## Deploy
- Development: `npm run dev`
- Production build: `npm run build`
- Production start: `npm start`
