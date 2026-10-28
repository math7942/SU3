// 학생 답안 제출 · 교사 피드백용 Firebase 모듈 (구글 로그인 + Firestore 'submissions').
// 페이지에서 <script type="module" src="../../assets/firebase-submit.js"></script> 로 불러오면
// window.SU3Submit 이 생긴다. 학생은 자기 제출물만, 교사 계정은 전부 읽을 수 있다
// (권한은 화면이 아니라 Firestore 보안 규칙이 결정한다).
import { firebaseConfig, SDK } from './firebase-store.js';

const COL = 'submissions';
let fb = null;

const ready = (async () => {
  const [appMod, authMod, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`)
  ]);
  const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
  fb = { fs, au: authMod, auth: authMod.getAuth(app), db: fs.getFirestore(app) };
  return fb;
})();

function plain(d) {
  const v = d.data();
  const t = v.createdAt && v.createdAt.toMillis ? v.createdAt.toMillis() : Date.now();
  const f = v.feedbackAt && v.feedbackAt.toMillis ? v.feedbackAt.toMillis() : null;
  return Object.assign({}, v, { id: d.id, createdAt: t, feedbackAt: f });
}

// 학생이 만든 값이 저장되므로, 화면에 HTML로 그릴 때는 반드시 이 함수를 거친다.
// DOMPurify가 없으면 태그를 모두 글자로 바꿔 그린다.
function safeHtml(html) {
  const s = String(html == null ? '' : html);
  if (window.DOMPurify) return window.DOMPurify.sanitize(s);
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

window.SU3Submit = {
  ready,
  safeHtml,
  onAuth(cb) {
    ready.then((f) => f.au.onAuthStateChanged(f.auth, cb)).catch((e) => { console.error(e); cb(null, e); });
  },
  async login() {
    const f = await ready;
    await f.au.signInWithPopup(f.auth, new f.au.GoogleAuthProvider());
  },
  async logout() {
    const f = await ready;
    await f.au.signOut(f.auth);
  },
  async submit(rec) {
    const f = await ready;
    const u = f.auth.currentUser;
    if (!u) throw new Error('로그인이 필요합니다.');
    await f.fs.addDoc(f.fs.collection(f.db, COL), Object.assign({}, rec, {
      uid: u.uid,
      email: u.email || '',
      createdAt: f.fs.serverTimestamp()
    }));
  },
  // 내 제출물 (최신순)
  listMine(cb) {
    let unsub = null;
    let stopped = false;
    ready.then((f) => {
      const u = f.auth.currentUser;
      if (stopped || !u) return;
      const q = f.fs.query(f.fs.collection(f.db, COL), f.fs.where('uid', '==', u.uid));
      unsub = f.fs.onSnapshot(q, (snap) => {
        cb(snap.docs.map(plain).sort((a, b) => b.createdAt - a.createdAt));
      }, (err) => { console.error(err); cb(null, err); });
    });
    return () => { stopped = true; if (unsub) unsub(); };
  },
  // 교사용: 전체 제출물 (최신 300개)
  listAll(cb) {
    let unsub = null;
    let stopped = false;
    ready.then((f) => {
      if (stopped) return;
      const q = f.fs.query(f.fs.collection(f.db, COL), f.fs.orderBy('createdAt', 'desc'), f.fs.limit(300));
      unsub = f.fs.onSnapshot(q, (snap) => cb(snap.docs.map(plain)), (err) => { console.error(err); cb(null, err); });
    });
    return () => { stopped = true; if (unsub) unsub(); };
  },
  async setFeedback(id, text) {
    const f = await ready;
    await f.fs.updateDoc(f.fs.doc(f.db, COL, id), {
      feedback: String(text).slice(0, 2000),
      feedbackAt: f.fs.serverTimestamp()
    });
  }
};
document.dispatchEvent(new Event('su3submit-ready'));
