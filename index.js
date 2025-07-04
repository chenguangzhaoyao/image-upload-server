const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 静态资源路径
const imageDir = path.join(__dirname, 'images');
app.use('/images', express.static(imageDir));

// 创建 images 文件夹（如果不存在）
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir);

// 读取或初始化 JSON 映射文件
const mapPath = path.join(imageDir, 'question_image_map.json');
let imageMap = {};
if (fs.existsSync(mapPath)) {
  try {
    imageMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  } catch {
    imageMap = {};
  }
}

// 上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imageDir),
  filename: (req, file, cb) => {
    const id = req.params.id;
    const timestamp = Date.now();
    const filename = `question_${id}_${timestamp}.png`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// 上传图片接口
app.post('/upload/:id', upload.single('file'), (req, res) => {
  const rawId = req.params.id;
  const realId = rawId.split('_')[0];
  const uploadedFile = req.file;
  if (!uploadedFile) return res.status(400).json({ error: 'No file uploaded' });

  const filename = uploadedFile.filename;

  imageMap[realId] ||= [];
  if (!imageMap[realId].includes(filename)) {
    imageMap[realId].push(filename);
    fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2), 'utf-8');
  }

  res.json({ ok: true, file: `/images/${filename}` });
});

// 删除图片接口
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(imageDir, filename);

  // 删除文件本体
  fs.unlink(filepath, err => {
    if (err) return res.status(404).json({ error: 'File not found' });

    // 更新映射表
    let updated = false;
    for (const [key, files] of Object.entries(imageMap)) {
      const index = files.indexOf(filename);
      if (index !== -1) {
        imageMap[key].splice(index, 1);
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2), 'utf-8');
    }

    res.json({ ok: true });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
