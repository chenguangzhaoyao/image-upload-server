const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

// 创建存图文件夹
const uploadDir = path.join(__dirname, 'images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images'),
  filename: (req, file, cb) => {
    const id = req.params.id;
    cb(null, `question_${id}.png`);
  }
});
const upload = multer({ storage });

app.post('/upload/:id', upload.single('file'), (req, res) => {
  res.json({ ok: true, file: `/images/question_${req.params.id}.png` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
