// 명예의 전당·축제 소감 같은 "함께 보는 기록"을 Firebase(Firestore)에 저장하는 공용 모듈.
// 아래 firebaseConfig에 Firebase 콘솔의 설정값을 붙여 넣으면 모든 기기가 같은 기록을 본다.
// 값이 비어 있거나 Firebase에 접속하지 못하면 예전처럼 이 브라우저의 localStorage에 저장한다.
//
// 사용법 (페이지에서):
//   <script type="module" src="../assets/firebase-store.js"></script>
//   await HallStore.add('blendRecords', record, 20);
//   const stop = HallStore.subscribe('blendRecords', 20, (records) => { ... });
//   await HallStore.clear(['blendRecords', 'festivalFeedback']);

export const firebaseConfig = {
  apiKey: "AIzaSyD-vjDcKI1XRtWOYznrvzCKT8nOYs5690I",
  authDomain: "su3su3-e2669.firebaseapp.com",
  projectId: "su3su3-e2669",
  storageBucket: "su3su3-e2669.firebasestorage.app",
  messagingSenderId: "989821997199",
  appId: "1:989821997199:web:da319f053c098ea30560fa"
};

export const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
const configured = !Object.values(firebaseConfig).some((v) => /^YOUR_/.test(v));

// ---- localStorage 대체 구현 (설정 전이거나 Firebase를 쓸 수 없을 때) ----
const local = {
  read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
  },
  async add(key, record, max) {
    const records = local.read(key);
    records.unshift(record);
    while (records.length > max) records.pop();
    localStorage.setItem(key, JSON.stringify(records));
  },
  subscribe(key, max, cb) {
    const emit = () => cb(local.read(key).slice(0, max));
    emit();
    const timer = setInterval(emit, 3000);
    window.addEventListener('storage', emit);
    return () => { clearInterval(timer); window.removeEventListener('storage', emit); };
  },
  async clear(keys) {
    keys.forEach((k) => localStorage.removeItem(k));
  }
};

// ---- Firestore 구현 ----
let remotePromise = null;
function loadRemote() {
  if (!remotePromise) {
    remotePromise = (async () => {
      const [{ initializeApp }, fs] = await Promise.all([
        import(`${SDK}/firebase-app.js`),
        import(`${SDK}/firebase-firestore.js`)
      ]);
      return { fs, db: fs.getFirestore(initializeApp(firebaseConfig)) };
    })();
  }
  return remotePromise;
}

const remote = {
  async add(key, record) {
    const { fs, db } = await loadRemote();
    const docId = `${record.id}-${Math.random().toString(36).slice(2, 8)}`;
    await fs.setDoc(fs.doc(db, key, docId), record);
  },
  subscribe(key, max, cb) {
    let unsub = null;
    let stopped = false;
    loadRemote().then(({ fs, db }) => {
      if (stopped) return;
      const q = fs.query(fs.collection(db, key), fs.orderBy('id', 'desc'), fs.limit(max));
      unsub = fs.onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data())), (err) => {
        console.error('Firebase 읽기 실패', err);
        cb(null, err);
      });
    }).catch((err) => { console.error('Firebase 연결 실패', err); cb(null, err); });
    return () => { stopped = true; if (unsub) unsub(); };
  },
  async clear(keys) {
    const { fs, db } = await loadRemote();
    for (const key of keys) {
      const snap = await fs.getDocs(fs.collection(db, key));
      for (let i = 0; i < snap.docs.length; i += 400) {
        const batch = fs.writeBatch(db);
        snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
  }
};

const backend = configured ? remote : local;

window.HallStore = {
  isRemote: configured,
  add: (key, record, max = 20) => backend.add(key, record, max),
  subscribe: (key, max, cb) => backend.subscribe(key, max, cb),
  clear: async (keys) => {
    await backend.clear(keys);
    if (configured) await local.clear(keys); // 예전 브라우저 기록도 함께 정리
  }
};
document.dispatchEvent(new Event('hallstore-ready'));
