const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

// 创建图片存储目录
const uploadDir = path.join(__dirname, 'images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 上传处理（根据 ID+时间戳命名）
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images'),
  filename: (req, file, cb) => {
    const id = req.params.id; // 允许带时间戳
    cb(null, `question_${id}.png`);
  }
});
const upload = multer({ storage });

app.post('/upload/:id', upload.single('file'), (req, res) => {
  res.json({ ok: true, file: `/images/question_${req.params.id}.png` });
});

// 删除图片接口
app.delete('/delete/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, 'images', filename);
  if (!filename || !filename.endsWith('.png')) {
    return res.status(400).json({ error: '不合法的文件名' });
  }

  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('删除失败:', err.message);
      return res.status(404).json({ error: '文件不存在或无法删除' });
    }
    console.log(`✅ 已删除 ${filename}`);
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
