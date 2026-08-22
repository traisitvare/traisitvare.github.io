# CV Portfolio

Run `python3 -m http.server 8000`


## จุดที่เพิ่มในเวอร์ชันนี้

- JavaScript มี Comment แยกส่วนและอธิบายตำแหน่งแก้ไข
- หน้า `education.html` โหลดข้อมูลจาก `education-data.json`
- รูปการศึกษาอยู่ที่ `assets/images/education/`
- รูปผลงานจริงอยู่ที่ `assets/images/portfolio/`
- แต่ละผลงานรองรับหลายรูปผ่าน Array `images` ใน `gallery-data.json`

### ตัวอย่างเพิ่มหลายรูปให้ผลงาน

```json
"images": [
  "assets/images/portfolio/work-1.jpg",
  "assets/images/portfolio/work-1-detail.png"
]
```

รองรับนามสกุล `.jpg`, `.jpeg`, `.png`, `.webp` และ `.svg` โดยแนะนำอัตราส่วน 16:10

## แก้ไขเวอร์ชัน Original Design

- หน้าแรกยังคง Layout แบบเดิม: Hero, About, Experience, Projects และ Contact
- ข้อมูลส่วนตัว: `data.json`
- ประสบการณ์: `experience-data.json`
- การศึกษา: `education-data.json`
- ผลงานและรูปผลงาน: `gallery-data.json`
- รูปการศึกษา: `assets/images/education/`
- รูปผลงาน: `assets/images/portfolio/`

### ใส่รูปผลงานหลายรูป

```json
"image": "assets/images/portfolio/project-cover.jpg",
"images": [
  "assets/images/portfolio/project-detail-1.jpg",
  "assets/images/portfolio/project-detail-2.jpg"
]
```

`image` คือภาพหน้าปก และ `images` คือภาพรายละเอียดที่คลิกเปิดขนาดเต็มได้
