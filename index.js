const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用 CORS
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
    const filename = `question_${id}.png`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// 处理上传并更新 JSON 映射
app.post('/upload/:id', upload.single('file'), (req, res) => {
  const rawId = req.params.id; // 可能是 5_1699xxx
  const realId = rawId.split('_')[0]; // 截取题号部分
  const filename = `question_${rawId}.png`;

  // 重命名文件（附带时间戳）
  const oldPath = path.join(imageDir, `question_${rawId}.png`);
  const newPath = path.join(imageDir, filename);
  fs.renameSync(oldPath, newPath);

  // 更新映射
  imageMap[realId] ||= [];
  if (!imageMap[realId].includes(filename)) {
    imageMap[realId].push(filename);
    fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2), 'utf-8');
  }

  res.json({ ok: true, file: `/images/${filename}` });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
