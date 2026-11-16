// 수식을 글자로 바꾼다. 검토 화면과 docx 변환에서 수식이 빠지지 않게 하려고 만들었다.
// - Word 수식(OMML, docx): 분수·위첨자·아래첨자·근호·괄호를 읽어 "(분자)/(분모)", "x²", "√(x)" 같은 글로 바꾼다.
// - 한글 수식(hwpx 스크립트): over, sqrt, ^, _ 와 기호 이름(times, le …)을 같은 방식으로 바꾼다.
// 수식 모양 그대로는 아니지만, 검토할 때 글자가 빠지지 않는 것이 목적이다.

const M_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ' };
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '−': '₋' };
const WORDS = {
  times: '×', div: '÷', cdot: '·', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
  approx: '≈', pm: '±', mp: '∓', deg: '°', infty: '∞', rarrow: '→', larrow: '←', to: '→',
};

function scriptPart(text, map, wrapOpen, wrapClose) {
  const chars = Array.from(text);
  if (chars.length && chars.every((ch) => map[ch])) return chars.map((ch) => map[ch]).join('');
  return wrapOpen + text + wrapClose;
}
function supText(text) { return scriptPart(text, SUP, '^(', ')'); }
function subText(text) { return scriptPart(text, SUB, '_(', ')'); }
function unbrace(s) { return String(s).replace(/^\{/, '').replace(/\}$/, ''); }

// ---------- Word 수식(OMML) ----------
function kids(el, name) { return Array.prototype.filter.call(el.children, (c) => c.localName === name); }
function kid(el, name) { return kids(el, name)[0] || null; }
function ommlText(el) {
  if (!el) return '';
  switch (el.localName) {
    case 'oMath': case 'oMathPara': case 'e': case 'lim': case 'fName':
      return ommlChildren(el);
    case 'r': return kids(el, 't').map((t) => t.textContent).join('');
    case 'f': {
      const num = ommlText(kid(el, 'num')), den = ommlText(kid(el, 'den'));
      return '(' + num + ')/(' + den + ')';
    }
    case 'sSup': return ommlText(kid(el, 'e')) + supText(ommlText(kid(el, 'sup')));
    case 'sSub': return ommlText(kid(el, 'e')) + subText(ommlText(kid(el, 'sub')));
    case 'sSubSup':
      return ommlText(kid(el, 'e')) + subText(ommlText(kid(el, 'sub'))) + supText(ommlText(kid(el, 'sup')));
    case 'rad': {
      const deg = ommlText(kid(el, 'deg'));
      return (deg ? deg : '') + '√(' + ommlText(kid(el, 'e')) + ')';
    }
    case 'd': {
      const pr = kid(el, 'dPr');
      const beg = pr && kid(pr, 'begChr'), end = pr && kid(pr, 'endChr');
      const open = beg ? beg.getAttributeNS(M_NS, 'val') || beg.getAttribute('m:val') || '(' : '(';
      const close = end ? end.getAttributeNS(M_NS, 'val') || end.getAttribute('m:val') || ')' : ')';
      return open + kids(el, 'e').map(ommlText).join(', ') + close;
    }
    case 'eqArr': return kids(el, 'e').map(ommlText).join(' ');
    case 'm': return kids(el, 'mr').map((row) => kids(row, 'e').map(ommlText).join(', ')).join('; ');
    case 'nary': case 'bar': case 'acc': case 'groupChr': case 'box': case 'func': case 'borderBox': case 'phant':
      return ommlChildren(el);
    default:
      return /Pr$/.test(el.localName) ? '' : ommlChildren(el);
  }
}
function ommlChildren(el) {
  return Array.prototype.map.call(el.children, (c) => (/Pr$/.test(c.localName) ? '' : ommlText(c))).join('');
}

function setWordText(doc, text) {
  const r = doc.createElementNS(W_NS, 'w:r');
  const t = doc.createElementNS(W_NS, 'w:t');
  t.setAttribute('xml:space', 'preserve');
  t.textContent = text;
  r.appendChild(t);
  return r;
}

// docx 한 개를 화면용으로 바꾼다. 수식(OMML)이 없으면 원래 파일을 그대로 돌려준다.
// JSZip(전역)과 DOMParser를 쓴다.
export async function prepareDocxForView(arrayBuffer) {
  const z = await JSZip.loadAsync(arrayBuffer);
  const docFile = z.file('word/document.xml');
  if (!docFile) return arrayBuffer;
  const xml = await docFile.async('string');
  if (xml.indexOf('<m:oMath') < 0) return arrayBuffer;
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  // 수식 덩어리마다 글로 바꾼 글자 칸을 넣는다. 가운데 맞춤 수식(oMathPara)을 먼저 처리한다.
  Array.prototype.slice.call(doc.getElementsByTagNameNS(M_NS, 'oMathPara')).forEach((para) => {
    const text = kids(para, 'oMath').map(ommlText).join('');
    const parent = para.parentNode;
    if (!parent) return;
    if (parent.localName === 'p') {
      parent.replaceChild(setWordText(doc, text), para);
    } else {
      const p = doc.createElementNS(W_NS, 'w:p');
      p.appendChild(setWordText(doc, text));
      parent.replaceChild(p, para);
    }
  });
  Array.prototype.slice.call(doc.getElementsByTagNameNS(M_NS, 'oMath')).forEach((math) => {
    if (!math.parentNode) return;
    math.parentNode.replaceChild(setWordText(doc, ommlText(math)), math);
  });
  z.file('word/document.xml', new XMLSerializer().serializeToString(doc));
  return z.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
}

// ---------- 한글 수식(hwpx 스크립트) ----------
// over: 앞뒤 항을 분수로. sqrt{x}: 근호. ^, _: 위·아래 첨자. 나머지 명령은 글자 기호로 바꾼다.
export function hwpScriptToText(script) {
  let s = String(script || '').replace(/[\r\n#]/g, ' ');
  s = s.replace(/LEFT\s*/g, '').replace(/RIGHT\s*/g, '');
  s = s.replace(/\b(rm|it|bold|BOLD|ITALIC|ROMAN)\b/g, '');
  s = s.replace(/sqrt\s*(\{[^{}]*\}|\S+)/g, (m, a) => '√(' + unbrace(a) + ')');
  s = s.replace(/\^\s*(\{[^{}]*\}|\S)/g, (m, a) => supText(unbrace(a)));
  s = s.replace(/_\s*(\{[^{}]*\}|\S)/g, (m, a) => subText(unbrace(a)));
  // over: 앞뒤 항을 분수로 (괄호로 묶인 항, 중괄호 항, 낱말 항을 다룬다)
  const operand = '(\\([^()]*\\)|\\{[^{}]*\\}|[^\\s{}()]+)';
  const wrap = (x) => (/^\(.*\)$/.test(x) ? x : '(' + x + ')');
  let prev;
  do {
    prev = s;
    s = s.replace(new RegExp(operand + '\\s+over\\s+' + operand, 'g'), (m, a, b) => wrap(unbrace(a)) + '/' + wrap(unbrace(b)));
  } while (s !== prev);
  s = s.split(/\s+/).map((tok) => WORDS[tok] || tok).join(' ');
  s = s.replace(/[{}]/g, '').replace(/[~`]/g, ' ');
  return s.replace(/\s+/g, ' ').trim();
}
