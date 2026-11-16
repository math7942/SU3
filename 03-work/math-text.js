// 수식을 다룬다.
// - Word 수식(OMML, docx): 화면에서는 MathML로 그린다(분수·위첨자·근호가 원본처럼 쌓여 보인다).
//   파일 안에서는 수식 한 개를 글자 한 칸(개인 영역 문자)으로 두어 의견 위치를 맞춘다.
//   다운로드 파일과 요약 문서에는 수식을 읽을 수 있는 글자로 바꿔 넣는다.
// - 한글 수식(hwpx 스크립트): 읽을 수 있는 글자로 바꾼다 (hwpScriptToText).
// 의견 위치는 화면의 글자 순서로 정하므로, 수식 한 개는 항상 글자 한 칸으로 센다.

const M_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const EQ_BASE = 0xE000;   // 수식 표시 글자의 시작 (개인 영역 문자)
const EQ_MAX = 2048;      // 0xE000 ~ 0xE7FF (기호 글꼴의 체크박스 글자와 겹치지 않게)
const EQ_CHAR = /[\uE000-\uE7FF]/g;
// 기호 글꼴의 체크박스 글자(U+F0xx)를 보이는 글자로 바꾼다 (예: 체크된 상자 U+F0FE → ☑)
const SYMBOL_CHARS = { '\uF0FE': '☑', '\uF0FD': '☒', '\uF0FC': '✓', '\uF06E': '■', '\uF06F': '□', '\uF0A8': '□', '\uF0A7': '■' };
export function mapSymbols(s) { return String(s).replace(/[\uF000-\uF0FF]/g, (ch) => SYMBOL_CHARS[ch] || '□'); }

const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ' };
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '−': '₋' };
const WORDS = {
  times: '×', div: '÷', cdot: '·', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
  approx: '≈', pm: '±', mp: '∓', deg: '°', infty: '∞', rarrow: '→', larrow: '←', to: '→',
};
const VULGAR = {
  '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾', '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
  '1/6': '⅙', '5/6': '⅚', '1/7': '⅐', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞', '1/9': '⅑', '1/10': '⅒',
};

function scriptPart(text, map, wrapOpen, wrapClose) {
  const chars = Array.from(text);
  if (chars.length && chars.every((ch) => map[ch])) return chars.map((ch) => map[ch]).join('');
  return wrapOpen + text + wrapClose;
}
function supText(text) { return scriptPart(text, SUP, '^(', ')'); }
function subText(text) { return scriptPart(text, SUB, '_(', ')'); }
function unbrace(s) { return String(s).replace(/^\{/, '').replace(/\}$/, ''); }
// 분수(글자 버전): 흔한 숫자 분수는 한 글자, 다른 숫자 분수는 ⁴⁄₂, 문자 분수는 a/b, 그 밖에는 (분자)/(분모)
function fracText(num, den) {
  const n = String(num).trim(), d = String(den).trim();
  if (VULGAR[n + '/' + d]) return VULGAR[n + '/' + d];
  if (/^[0-9]+$/.test(n) && /^[0-9]+$/.test(d)) {
    return n.split('').map((ch) => SUP[ch]).join('') + '⁄' + d.split('').map((ch) => SUB[ch]).join('');
  }
  if (/^[A-Za-z0-9]+$/.test(n) && /^[A-Za-z0-9]+$/.test(d)) return n + '/' + d;
  const wrap = (x) => (/^\(.*\)$/.test(x) ? x : '(' + x + ')');
  return wrap(n) + '/' + wrap(d);
}

// ---------- Word 수식(OMML) → 글자 ----------
function kids(el, name) { return Array.prototype.filter.call(el.children, (c) => c.localName === name); }
function kid(el, name) { return kids(el, name)[0] || null; }
function ommlText(el) {
  if (!el) return '';
  switch (el.localName) {
    case 'oMath': case 'oMathPara': case 'e': case 'lim': case 'fName':
      return ommlChildren(el);
    case 'r': return kids(el, 't').map((t) => t.textContent).join('');
    case 'f': return fracText(ommlText(kid(el, 'num')), ommlText(kid(el, 'den')));
    case 'sSup': return ommlText(kid(el, 'e')) + supText(ommlText(kid(el, 'sup')));
    case 'sSub': return ommlText(kid(el, 'e')) + subText(ommlText(kid(el, 'sub')));
    case 'sSubSup':
      return ommlText(kid(el, 'e')) + subText(ommlText(kid(el, 'sub'))) + supText(ommlText(kid(el, 'sup')));
    case 'rad': {
      const deg = ommlText(kid(el, 'deg'));
      return (deg ? deg : '') + '√(' + ommlText(kid(el, 'e')) + ')';
    }
    case 'd': {
      const [open, close] = fenceChars(el, '(', ')');
      return open + kids(el, 'e').map(ommlText).join(', ') + close;
    }
    case 'eqArr': return kids(el, 'e').map(ommlText).join(' ');
    case 'm': return kids(el, 'mr').map((row) => kids(row, 'e').map(ommlText).join(', ')).join('; ');
    default:
      return /Pr$/.test(el.localName) ? '' : ommlChildren(el);
  }
}
function ommlChildren(el) {
  return Array.prototype.map.call(el.children, (c) => (/Pr$/.test(c.localName) ? '' : ommlText(c))).join('');
}
function fenceChars(el, dOpen, dClose) {
  const pr = kid(el, 'dPr');
  const beg = pr && kid(pr, 'begChr'), end = pr && kid(pr, 'endChr');
  const open = beg ? (beg.getAttributeNS(M_NS, 'val') || beg.getAttribute('m:val') || dOpen) : dOpen;
  const close = end ? (end.getAttributeNS(M_NS, 'val') || end.getAttribute('m:val') || dClose) : dClose;
  return [open, close];
}
function chrOf(el, prName, dflt) {
  const pr = kid(el, prName);
  const c = pr && kid(pr, 'chr');
  return (c && (c.getAttributeNS(M_NS, 'val') || c.getAttribute('m:val'))) || dflt;
}

// ---------- Word 수식(OMML) → MathML ----------
function mmlEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const OP_CHARS = '+\\-−=<>×÷·±∓≤≥≠≈→←';
const OP_ONE = new RegExp('^[' + OP_CHARS + ']$');
// 글자 묶음을 숫자·문자·기호로 나눠 MathML 조각으로 만든다
function mmlRun(text) {
  const pieces = String(text).match(new RegExp('\\d+(?:\\.\\d+)?|\\p{L}+|[' + OP_CHARS + ']|[^\\s\\d\\p{L}' + OP_CHARS + ']+|\\s+', 'gu')) || [];
  return pieces.map((p) => {
    if (/^\s+$/.test(p)) return '';
    if (/^\d/.test(p)) return '<mn>' + mmlEsc(p) + '</mn>';
    if (/^\p{L}/u.test(p)) return '<mi>' + mmlEsc(p) + '</mi>';
    if (OP_ONE.test(p)) return '<mo>' + mmlEsc(p) + '</mo>';
    return '<mtext>' + mmlEsc(p) + '</mtext>';
  }).join('');
}
function mrow(s) { return '<mrow>' + s + '</mrow>'; }
function mmlChildren(el) {
  if (!el) return '';
  return Array.prototype.map.call(el.children, (c) => (/Pr$/.test(c.localName) ? '' : mmlNode(c))).join('');
}
function mmlNode(el) {
  switch (el.localName) {
    case 'oMath': case 'oMathPara': case 'e': case 'lim': case 'fName': case 'num': case 'den':
    case 'sup': case 'sub': case 'deg': case 'groupChr': case 'box': case 'phant': case 'borderBox':
      return mmlChildren(el);
    case 'r': return kids(el, 't').map((t) => mmlRun(t.textContent)).join('');
    case 'f': return '<mfrac>' + mrow(mmlChildren(kid(el, 'num'))) + mrow(mmlChildren(kid(el, 'den'))) + '</mfrac>';
    case 'sSup': return '<msup>' + mrow(mmlChildren(kid(el, 'e'))) + mrow(mmlChildren(kid(el, 'sup'))) + '</msup>';
    case 'sSub': return '<msub>' + mrow(mmlChildren(kid(el, 'e'))) + mrow(mmlChildren(kid(el, 'sub'))) + '</msub>';
    case 'sSubSup':
      return '<msubsup>' + mrow(mmlChildren(kid(el, 'e'))) + mrow(mmlChildren(kid(el, 'sub'))) + mrow(mmlChildren(kid(el, 'sup'))) + '</msubsup>';
    case 'rad': {
      const deg = kid(el, 'deg');
      const body = mrow(mmlChildren(kid(el, 'e')));
      const degXml = deg ? mmlChildren(deg) : '';
      return degXml ? '<mroot>' + body + mrow(degXml) + '</mroot>' : '<msqrt>' + body + '</msqrt>';
    }
    case 'd': {
      const [open, close] = fenceChars(el, '(', ')');
      const parts = kids(el, 'e').map((e) => mrow(mmlChildren(e)));
      return mrow('<mo>' + mmlEsc(open) + '</mo>' + parts.join('<mo>,</mo>') + '<mo>' + mmlEsc(close) + '</mo>');
    }
    case 'nary': {
      const chr = chrOf(el, 'naryPr', '∫');
      const op = '<mo>' + mmlEsc(chr) + '</mo>';
      const sub = kid(el, 'sub'), sup = kid(el, 'sup');
      const subXml = mmlChildren(sub), supXml = mmlChildren(sup);
      const pr = kid(el, 'naryPr');
      const locEl = pr && kid(pr, 'limLoc');
      const loc = locEl ? (locEl.getAttributeNS(M_NS, 'val') || locEl.getAttribute('m:val')) : (SIDE_LIMIT_OPS.indexOf(chr) >= 0 ? 'subSup' : 'undOvr');
      let head = op;
      if (loc === 'subSup') {
        if (subXml && supXml) head = '<msubsup>' + op + mrow(subXml) + mrow(supXml) + '</msubsup>';
        else if (subXml) head = '<msub>' + op + mrow(subXml) + '</msub>';
        else if (supXml) head = '<msup>' + op + mrow(supXml) + '</msup>';
      } else if (subXml || supXml) {
        head = '<munderover>' + op + mrow(subXml) + mrow(supXml) + '</munderover>';
      }
      return mrow(head + mrow(mmlChildren(kid(el, 'e'))));
    }
    case 'acc':
      return '<mover>' + mrow(mmlChildren(kid(el, 'e'))) + '<mo>' + mmlEsc(chrOf(el, 'accPr', '^')) + '</mo></mover>';
    case 'bar':
      return '<mover>' + mrow(mmlChildren(kid(el, 'e'))) + '<mo>¯</mo></mover>';
    case 'func':
      return mrow(mmlChildren(kid(el, 'fName')) + mrow(mmlChildren(kid(el, 'e'))));
    case 'limLow':
      return '<munder>' + mrow(mmlChildren(kid(el, 'e'))) + mrow(mmlChildren(kid(el, 'lim'))) + '</munder>';
    case 'limUpp':
      return '<mover>' + mrow(mmlChildren(kid(el, 'e'))) + mrow(mmlChildren(kid(el, 'lim'))) + '</mover>';
    case 'm': {
      const rows = kids(el, 'mr').map((row) => '<mtr>' + kids(row, 'e').map((e) => '<mtd>' + mrow(mmlChildren(e)) + '</mtd>').join('') + '</mtr>');
      return '<mtable>' + rows.join('') + '</mtable>';
    }
    case 'eqArr': {
      const rows = kids(el, 'e').map((e) => '<mtr><mtd>' + mrow(mmlChildren(e)) + '</mtd></mtr>');
      return '<mtable>' + rows.join('') + '</mtable>';
    }
    default:
      return /Pr$/.test(el.localName) ? '' : mmlChildren(el);
  }
}

// ---------- docx 준비 ----------
function setWordText(doc, text) {
  const r = doc.createElementNS(W_NS, 'w:r');
  const t = doc.createElementNS(W_NS, 'w:t');
  t.setAttribute('xml:space', 'preserve');
  t.textContent = text;
  r.appendChild(t);
  return r;
}
function eqChar(k) { return String.fromCharCode(EQ_BASE + k); }

// 워드의 겹침 필드(eq \o\ac(□,√))는 상자 위에 기호를 겹쳐 그린 것이다.
// 화면에서는 필드 코드가 보이지 않으므로 체크된 상자는 ☑, 엑스 표시는 ☒로 바꾼다.
const OVERLAY_FIELD = /eq\s*\\o\s*\\ac\s*\(\s*([^,]*?)\s*,\s*([^)]*?)\s*\)/;
function overlayFieldText(instr) {
  const m = OVERLAY_FIELD.exec(instr);
  if (!m) return null;
  const over = m[2];
  if (over.indexOf('√') >= 0 || over.indexOf('✓') >= 0) return '☑';
  if (over.indexOf('×') >= 0 || /x/i.test(over)) return '☒';
  return mapSymbols(m[1] || '□');
}
function replaceOverlayFields(doc) {
  const runs = Array.prototype.slice.call(doc.getElementsByTagNameNS(W_NS, 'r'));
  let depth = 0;
  let group = null;
  let instr = '';
  runs.forEach((run) => {
    const fc = run.getElementsByTagNameNS(W_NS, 'fldChar')[0];
    const type = fc ? fc.getAttributeNS(W_NS, 'fldCharType') : null;
    if (depth === 0 && type !== 'begin') return;
    if (depth === 0) { group = []; instr = ''; }
    group.push(run);
    Array.prototype.slice.call(run.getElementsByTagNameNS(W_NS, 'instrText')).forEach((t) => { instr += t.textContent; });
    if (type === 'begin') { depth++; return; }
    if (type !== 'end') return;
    depth--;
    if (depth !== 0) return;
    const text = overlayFieldText(instr);
    const first = group[0];
    const last = group[group.length - 1];
    if (text !== null && first.parentNode) {
      const nr = doc.createElementNS(W_NS, 'w:r');
      // 필드 뒤에 오는 글자의 서식(글꼴 등)을 따른다
      const after = last.nextElementSibling;
      const rPr = after && after.localName === 'r' ? after.getElementsByTagNameNS(W_NS, 'rPr')[0] : null;
      if (rPr) nr.appendChild(rPr.cloneNode(true));
      const t = doc.createElementNS(W_NS, 'w:t');
      t.setAttribute('xml:space', 'preserve');
      t.textContent = text;
      nr.appendChild(t);
      first.parentNode.insertBefore(nr, first);
      group.forEach((r) => { if (r.parentNode) r.parentNode.removeChild(r); });
    }
    group = null;
  });
}

// docx 한 개를 화면용으로 바꾼다.
//   buffer: 변환한 docx (수식은 글자 한 칸으로 바뀌어 있다)
//   eqs: 수식 목록 [{ mathml, text }] (칸 번호 = 목록 순서)
// 수식과 흰색 글자가 없으면 원래 파일을 그대로 돌려준다. JSZip(전역)과 DOMParser를 쓴다.
export async function prepareDocxForView(arrayBuffer) {
  const z = await JSZip.loadAsync(arrayBuffer);
  const docFile = z.file('word/document.xml');
  if (!docFile) return { buffer: arrayBuffer, eqs: [] };
  const xml = await docFile.async('string');
  const hasMath = xml.indexOf('<m:oMath') >= 0;
  const hasWhite = /w:color w:val="ffffff"/i.test(xml);
  const hasSymbols = /[\uF000-\uF0FF]/.test(xml) || xml.indexOf('<w:sym') >= 0;
  const hasOverlay = xml.indexOf('\\ac(') >= 0;
  if (!hasMath && !hasWhite && !hasSymbols && !hasOverlay) return { buffer: arrayBuffer, eqs: [] };
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  // 흰색 글자(배경과 같은 색)는 화면에서 보이지 않으므로 버린다
  Array.prototype.slice.call(doc.getElementsByTagNameNS(W_NS, 'color')).forEach((c) => {
    if ((c.getAttributeNS(W_NS, 'val') || '').toLowerCase() !== 'ffffff') return;
    const run = c.parentNode && c.parentNode.parentNode;
    if (run && run.localName === 'r' && run.parentNode) run.parentNode.removeChild(run);
  });
  // 겹침 필드(eq \o\ac(□,√))의 체크 상자를 ☑로 바꾼다
  if (hasOverlay) replaceOverlayFields(doc);
  // 워드의 기호 글자(w:sym, 예: 기호 글꼴 F0FE)를 일반 글자로 바꾼 뒤 보이는 글자로 고친다
  Array.prototype.slice.call(doc.getElementsByTagNameNS(W_NS, 'sym')).forEach((sym) => {
    const code = parseInt(sym.getAttributeNS(W_NS, 'char') || '', 16);
    if (isNaN(code) || !sym.parentNode) return;
    const t = doc.createElementNS(W_NS, 'w:t');
    t.setAttribute('xml:space', 'preserve');
    t.textContent = mapSymbols(String.fromCodePoint(code));
    sym.parentNode.replaceChild(t, sym);
  });
  // 체크박스 같은 기호 글자를 보이는 글자로 바꾼다
  Array.prototype.slice.call(doc.getElementsByTagNameNS(W_NS, 't')).forEach((t) => {
    if (/[\uF000-\uF0FF]/.test(t.textContent)) t.textContent = mapSymbols(t.textContent);
  });
  const eqs = [];
  if (hasMath) {
    // 가운데 맞춤 수식(oMathPara)을 먼저 처리한다: 수식 하나 = 글자 한 칸
    Array.prototype.slice.call(doc.getElementsByTagNameNS(M_NS, 'oMathPara')).forEach((para) => {
      const k = eqs.length;
      eqs.push({
        mathml: '<math display="block">' + mmlChildren(para) + '</math>',
        text: kids(para, 'oMath').map(ommlText).join(''),
      });
      const parent = para.parentNode;
      if (!parent) return;
      const run = setWordText(doc, eqChar(k));
      if (parent.localName === 'p') {
        parent.replaceChild(run, para);
      } else {
        const p = doc.createElementNS(W_NS, 'w:p');
        p.appendChild(run);
        parent.replaceChild(p, para);
      }
    });
    Array.prototype.slice.call(doc.getElementsByTagNameNS(M_NS, 'oMath')).forEach((math) => {
      if (!math.parentNode) return;
      const k = eqs.length;
      eqs.push({ mathml: '<math>' + mmlNode(math) + '</math>', text: ommlText(math) });
      math.parentNode.replaceChild(setWordText(doc, eqChar(k)), math);
    });
  }
  z.file('word/document.xml', new XMLSerializer().serializeToString(doc));
  const buffer = await z.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  return { buffer, eqs: eqs.slice(0, EQ_MAX) };
}

// mammoth가 만든 HTML의 수식 칸을 MathML 요소로 바꾼다 (칸 하나 = 요소 하나)
export function decorateEquations(html, eqs) {
  if (!eqs || !eqs.length) return html;
  return String(html).replace(EQ_CHAR, (ch) => {
    const k = ch.charCodeAt(0) - EQ_BASE;
    const eq = eqs[k];
    return eq ? '<span class="eqv" data-k="' + k + '">' + eq.mathml + '</span>' : ch;
  });
}
// 수식 칸을 읽을 수 있는 글자로 바꾼다 (다운로드 파일, 요약 문서)
export function equationsToText(s, eqs) {
  if (!eqs || !eqs.length) return s;
  return String(s).replace(EQ_CHAR, (ch) => {
    const eq = eqs[ch.charCodeAt(0) - EQ_BASE];
    return eq ? eq.text : ch;
  });
}

// ---------- 한글 수식(hwpx 스크립트) → 글자 ----------
// over: 앞뒤 항을 분수로. sqrt{x}: 근호. ^, _: 위·아래 첨자. 나머지 명령은 글자 기호로 바꾼다.
export function hwpScriptToText(script) {
  let s = String(script || '').replace(/[\r\n#]/g, ' ');
  s = s.replace(/LEFT\s*/g, '').replace(/RIGHT\s*/g, '');
  s = s.replace(/\b(rm|it|bold|BOLD|ITALIC|ROMAN)\b/g, '');
  s = s.replace(/sqrt\s*(\{[^{}]*\}|\S+)/g, (m, a) => '√(' + unbrace(a) + ')');
  s = s.replace(/\^\s*(\{[^{}]*\}|\S)/g, (m, a) => supText(unbrace(a)));
  s = s.replace(/_\s*(\{[^{}]*\}|\S)/g, (m, a) => subText(unbrace(a)));
  const operand = '(\\([^()]*\\)|\\{[^{}]*\\}|[^\\s{}()]+)';
  let prev;
  do {
    prev = s;
    s = s.replace(new RegExp(operand + '\\s+over\\s+' + operand, 'g'), (m, a, b) => fracText(unbrace(a), unbrace(b)));
  } while (s !== prev);
  s = s.split(/\s+/).map((tok) => WORDS[tok] || tok).join(' ');
  s = s.replace(/[{}]/g, '').replace(/[~`]/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

// ---------- 한글 수식 스크립트 → Word 수식(OMML) ----------
// 분수(over), 근호(sqrt), 괄호(LEFT … RIGHT), 위·아래 첨자(^ _), 큰 연산자(int, sum, lim), 기호 이름, 그리스 문자를 옮긴다.
// 읽지 못하는 스크립트는 null을 돌려주고, 호출하는 쪽이 글자 버전을 쓴다.
const HWP_SYMS = {
  rarrow: '→', larrow: '←', to: '→', INF: '∞', infty: '∞', GEQ: '≥', geq: '≥', LEQ: '≤', leq: '≤',
  le: '≤', ge: '≥', ne: '≠', NEQ: '≠', times: '×', cdot: '·', CDOTS: '⋯', LDOTS: '…', prime: '′',
  pi: 'π', PI: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ', lambda: 'λ', mu: 'μ',
  sigma: 'σ', SIGMA: 'Σ', DELTA: 'Δ', omega: 'ω', epsilon: 'ε', pm: '±', approx: '≈', equiv: '≡', deg: '°',
};
const HWP_BIG = { int: '∫', sum: '∑', prod: '∏' };
const SIDE_LIMIT_OPS = ['∫', '∬', '∭', '∮'];   // 적분 기호는 한계를 옆에 쓴다 (한글이 저장할 때와 같다)
const HWP_FUNCS = /^(ln|log|exp|sin|cos|tan)/;

function xmlEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// 명령 이름 목록: 붙여 쓴 낱말(sinpix, lnx …)을 이 목록으로 나눈다
const HWP_KEYWORDS = new Set([
  ...Object.keys(HWP_SYMS), ...Object.keys(HWP_BIG),
  'over', 'sqrt', 'LEFT', 'RIGHT', 'left', 'right', 'lim', 'rm', 'RM', 'it', 'IT', 'bold', 'ln', 'log', 'exp', 'sin', 'cos', 'tan',
]);
function splitWord(w) {
  if (w.length <= 1 || HWP_KEYWORDS.has(w)) return [w];
  for (let k = w.length - 1; k >= 2; k--) {
    const head = w.slice(0, k);
    if (HWP_KEYWORDS.has(head)) return [head, ...splitWord(w.slice(k))];
  }
  return [w];
}
function hwpTokens(script) {
  const s = String(script || '').replace(/[\r\n#`~]/g, ' ');
  const re = /''|[A-Za-z]+|\d+(?:\.\d+)?|\S/g;
  const out = [];
  (s.match(re) || []).forEach((t) => {
    if (/^[A-Za-z]+$/.test(t)) out.push(...splitWord(t)); else out.push(t);
  });
  return out;
}

// 스크립트 한 개를 나무 구조로 읽는다
function hwpParse(script) {
  const T = hwpTokens(script);
  let i = 0;

  function parseSeq(stop) {
    const items = [];
    while (i < T.length && !stop(T[i])) {
      const t = T[i];
      if (t === 'over') {
        i++;
        const num = items.length ? items.pop() : { t: 'text', s: '' };
        const den = parseScripted(stop);
        items.push({ t: 'frac', num, den });
        continue;
      }
      if (HWP_BIG[t]) {
        // 큰 연산자: 아래·위 한계를 받고, 나머지 항목을 본문으로 삼는다
        i++;
        const nary = { t: 'nary', chr: HWP_BIG[t], sub: null, sup: null };
        for (let k = 0; k < 2 && i < T.length && (T[i] === '_' || T[i] === '^'); k++) {
          const kind = T[i++];
          const arg = parseAtom(stop);
          if (kind === '_') nary.sub = arg; else nary.sup = arg;
        }
        nary.body = { t: 'group', items: parseSeq(stop) };
        items.push(nary);
        break;
      }
      items.push(parseScripted(stop));
    }
    return items;
  }

  function parseScripted(stop) {
    const base = parseAtom(stop);
    let sub = null, sup = null;
    for (let k = 0; k < 2 && i < T.length && (T[i] === '_' || T[i] === '^'); k++) {
      const kind = T[i++];
      const arg = parseAtom(stop);
      if (kind === '_') sub = arg; else sup = arg;
    }
    if (sub && sup) return { t: 'subsup', base, sub, sup };
    if (sub) return { t: 'sub', base, sub };
    if (sup) return { t: 'sup', base, sup };
    return base;
  }

  function parseAtom(stop) {
    if (i >= T.length) throw new Error('수식이 중간에 끝남');
    const t = T[i++];
    if (t === '{') {
      const items = parseSeq((x) => x === '}');
      if (T[i] !== '}') throw new Error('중괄호가 맞지 않음');
      i++;
      return { t: 'group', items };
    }
    if (t === '}') throw new Error('닫는 중괄호가 남음');
    if (t === 'sqrt') return { t: 'rad', e: parseAtom(stop) };
    if (t === 'LEFT' || t === 'left') {
      const open = T[i++];
      const items = parseSeq((x) => x === 'RIGHT' || x === 'right');
      if (!(T[i] === 'RIGHT' || T[i] === 'right')) throw new Error('RIGHT가 없음');
      i++;
      const close = T[i++];
      return { t: 'fence', open, close, items };
    }
    if (t === 'lim') {
      let sub = null;
      if (T[i] === '_') { i++; sub = parseAtom(stop); }
      return { t: 'limlow', lim: sub };
    }
    if (t === 'rm' || t === 'RM') return { t: 'plain', item: parseAtom(stop) };
    if (t === 'it' || t === 'IT' || t === 'bold') return parseAtom(stop);
    if (t === "'") return { t: 'text', s: '′' };
    if (t === "''") return { t: 'text', s: '″' };
    if (HWP_SYMS[t]) return { t: 'text', s: HWP_SYMS[t] };
    if (/^\d/.test(t)) return { t: 'text', s: t };
    if (/^[A-Za-z]+$/.test(t)) return { t: 'text', s: t, plain: HWP_FUNCS.test(t) };
    if (t === '^' || t === '_') throw new Error('첨자 위치가 틀림');
    return { t: 'text', s: t };
  }

  const items = parseSeq(() => false);
  if (i !== T.length) throw new Error('읽지 못한 부분이 남음');
  return items;
}

function ommlRunXml(text, plain) {
  const pr = plain ? '<m:rPr><m:sty m:val="p"/></m:rPr>' : '';
  return '<m:r>' + pr + '<m:t xml:space="preserve">' + xmlEsc(text) + '</m:t></m:r>';
}
function ommlItemsXml(items, plain) { return items.map((n) => ommlNodeXml(n, plain)).join(''); }
function ommlNodeXml(n, plain) {
  switch (n.t) {
    case 'text': return ommlRunXml(n.s, plain || !!n.plain);
    case 'group': return ommlItemsXml(n.items, plain);
    case 'plain': return ommlNodeXml(n.item, true);
    case 'frac': return '<m:f><m:num>' + ommlNodeXml(n.num, plain) + '</m:num><m:den>' + ommlNodeXml(n.den, plain) + '</m:den></m:f>';
    case 'sup': return '<m:sSup><m:e>' + ommlNodeXml(n.base, plain) + '</m:e><m:sup>' + ommlNodeXml(n.sup, plain) + '</m:sup></m:sSup>';
    case 'sub': return '<m:sSub><m:e>' + ommlNodeXml(n.base, plain) + '</m:e><m:sub>' + ommlNodeXml(n.sub, plain) + '</m:sub></m:sSub>';
    case 'subsup':
      return '<m:sSubSup><m:e>' + ommlNodeXml(n.base, plain) + '</m:e><m:sub>' + ommlNodeXml(n.sub, plain) +
        '</m:sub><m:sup>' + ommlNodeXml(n.sup, plain) + '</m:sup></m:sSubSup>';
    case 'rad': return '<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>' + ommlNodeXml(n.e, plain) + '</m:e></m:rad>';
    case 'fence':
      return '<m:d><m:dPr><m:begChr m:val="' + xmlEsc(n.open) + '"/><m:endChr m:val="' + xmlEsc(n.close) + '"/></m:dPr><m:e>' +
        ommlItemsXml(n.items, plain) + '</m:e></m:d>';
    case 'nary':
      return '<m:nary><m:naryPr><m:chr m:val="' + xmlEsc(n.chr) + '"/><m:limLoc m:val="' + (SIDE_LIMIT_OPS.indexOf(n.chr) >= 0 ? 'subSup' : 'undOvr') + '"/>' +
        (n.sub ? '' : '<m:subHide m:val="1"/>') + (n.sup ? '' : '<m:supHide m:val="1"/>') + '</m:naryPr><m:sub>' +
        (n.sub ? ommlNodeXml(n.sub, plain) : '') + '</m:sub><m:sup>' + (n.sup ? ommlNodeXml(n.sup, plain) : '') +
        '</m:sup><m:e>' + ommlNodeXml(n.body, plain) + '</m:e></m:nary>';
    case 'limlow':
      return '<m:limLow><m:e>' + ommlRunXml('lim', false) + '</m:e><m:lim>' + (n.lim ? ommlNodeXml(n.lim, plain) : '') + '</m:lim></m:limLow>';
    default: throw new Error('알 수 없는 수식 요소: ' + n.t);
  }
}

// 한글 수식 스크립트 → <m:oMath> 문자열. 읽지 못하면 null.
export function hwpScriptToOmml(script) {
  try {
    const items = hwpParse(script);
    return '<m:oMath>' + ommlItemsXml(items, false) + '</m:oMath>';
  } catch (e) {
    return null;
  }
}
