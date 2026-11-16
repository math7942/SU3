// 수식을 다룬다.
// - Word 수식(OMML, docx): 화면에서는 MathML로 그린다(분수·위첨자·근호가 원본처럼 쌓여 보인다).
//   파일 안에서는 수식 한 개를 글자 한 칸(개인 영역 문자)으로 두어 의견 위치를 맞춘다.
//   다운로드 파일과 요약 문서에는 수식을 읽을 수 있는 글자로 바꿔 넣는다.
// - 한글 수식(hwpx 스크립트): 읽을 수 있는 글자로 바꾼다 (hwpScriptToText).
// 의견 위치는 화면의 글자 순서로 정하므로, 수식 한 개는 항상 글자 한 칸으로 센다.

const M_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const EQ_BASE = 0xE000;   // 수식 표시 글자의 시작 (개인 영역 문자)
const EQ_MAX = 6400;      // 0xE000 ~ 0xF8FF
const EQ_CHAR = /[-]/g;

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
      const op = '<mo>' + mmlEsc(chrOf(el, 'naryPr', '∫')) + '</mo>';
      const sub = kid(el, 'sub'), sup = kid(el, 'sup');
      const head = (sub || sup)
        ? '<munderover>' + op + mrow(mmlChildren(sub)) + mrow(mmlChildren(sup)) + '</munderover>'
        : op;
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
  if (!hasMath && !hasWhite) return { buffer: arrayBuffer, eqs: [] };
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  // 흰색 글자(배경과 같은 색)는 화면에서 보이지 않으므로 버린다
  Array.prototype.slice.call(doc.getElementsByTagNameNS(W_NS, 'color')).forEach((c) => {
    if ((c.getAttributeNS(W_NS, 'val') || '').toLowerCase() !== 'ffffff') return;
    const run = c.parentNode && c.parentNode.parentNode;
    if (run && run.localName === 'r' && run.parentNode) run.parentNode.removeChild(run);
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
