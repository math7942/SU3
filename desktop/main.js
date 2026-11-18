const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: 'PDF 선택 지우기',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // 바깥 주소로 이동하거나 새 창을 열지 않는다 (파일은 이 컴퓨터 안에서만 처리)
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());
}

app.whenReady().then(() => {
  // 「PDF로 저장」은 다운로드 폴더에 바로 저장한다. 같은 이름이 있으면 (1), (2)를 붙인다.
  session.defaultSession.on('will-download', (event, item) => {
    const dir = app.getPath('downloads');
    const name = item.getFilename();
    const base = name.replace(/\.pdf$/i, '');
    let file = path.join(dir, name);
    let n = 1;
    while (fs.existsSync(file)) file = path.join(dir, `${base} (${n++}).pdf`);
    item.setSavePath(file);
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => app.quit());
