// 웹 페이지(03-work/pdf-privacy-eraser.html)를 데스크톱 앱의 화면 파일로 복사한다.
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', '..', '03-work', 'pdf-privacy-eraser.html');
const dstDir = path.join(__dirname, '..', 'app');
fs.mkdirSync(dstDir, { recursive: true });
fs.copyFileSync(src, path.join(dstDir, 'index.html'));
console.log('copied', src, '->', path.join(dstDir, 'index.html'));
