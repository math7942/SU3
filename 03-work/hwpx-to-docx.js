// 한글(.hwpx) 문서를 Word(.docx)로 바꾼다. 검토는 이 docx로 하고, 원본 hwpx는 따로 보관한다.
// 옮기는 것: 글자 모양(굵게·기울임·크기·색), 문단 정렬, 표(병합·칸별 테두리·배경색), 그림.
// 옮기지 못했거나 모양이 달라질 수 있는 것은 경고 목록으로 돌려준다 (떠 있는 개체, 지원하지 않는 개체, 좁은 칸의 긴 글).
// JSZip(전역)을 쓴다.

const NS_HP = 'http://www.hancom.co.kr/hwpml/2011/paragraph';
const NS_HH = 'http://www.hancom.co.kr/hwpml/2011/head';
const NS_HC = 'http://www.hancom.co.kr/hwpml/2011/core';
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const EMU = 127; // 1 HWPUNIT = 1/7200 인치 = 127 EMU
const JC = { JUSTIFY: 'both', LEFT: 'left', CENTER: 'center', RIGHT: 'right', DISTRIBUTE: 'both' };
const DASH = { DASH: 'dashed', DOT: 'dotted', DOUBLE_SLIM: 'double', DOUBLE: 'double' };
const UNSUPPORTED = {
  rect: '글상자', container: '묶음 개체', equation: '수식', ole: 'OLE 개체', line: '선', ellipse: '타원',
  arc: '호', polygon: '다각형', curve: '곡선', textart: '글맵시', video: '동영상', chart: '차트'
};
const IMG_TYPES = { png: 'image/png', bmp: 'image/bmp', jpeg: 'image/jpeg', gif: 'image/gif' };

function kids(el, name) { return Array.prototype.filter.call(el.children, (c) => c.localName === name); }
function kid(el, name) { return kids(el, name)[0] || null; }
function xmlEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function cleanText(s) { return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''); }
function sumRange(arr, from, count) { return arr.slice(from, from + count).reduce((a, b) => a + b, 0); }

function parseXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('한글 파일의 내용을 읽지 못했습니다.');
  return doc;
}

// 글자 모양, 문단 모양, 칸 테두리·배경(header.xml)
function loadStyles(doc) {
  const chars = {}, paras = {}, fills = {};
  Array.from(doc.getElementsByTagNameNS(NS_HH, 'charPr')).forEach((cp) => {
    chars[cp.getAttribute('id')] = {
      size: Math.floor(parseInt(cp.getAttribute('height') || '1000', 10) / 50), // 1/100pt -> 반 포인트
      color: (cp.getAttribute('textColor') || '#000000').replace('#', ''),
      bold: !!kid(cp, 'bold'),
      italic: !!kid(cp, 'italic'),
    };
  });
  Array.from(doc.getElementsByTagNameNS(NS_HH, 'paraPr')).forEach((pp) => {
    const al = kid(pp, 'align');
    paras[pp.getAttribute('id')] = al ? al.getAttribute('horizontal') : 'JUSTIFY';
  });
  Array.from(doc.getElementsByTagNameNS(NS_HH, 'borderFill')).forEach((bf) => {
    const sides = {};
    ['left', 'right', 'top', 'bottom'].forEach((side) => {
      const el = kid(bf, side + 'Border');
      const type = el ? (el.getAttribute('type') || 'NONE') : 'NONE';
      if (!el || type === 'NONE') { sides[side] = null; return; }
      const mm = parseFloat(el.getAttribute('width') || '0.1') || 0.1;
      sides[side] = [DASH[type] || 'single', Math.max(2, Math.min(96, Math.round(mm / 2.835 * 8))), (el.getAttribute('color') || '#000000').replace('#', '')];
    });
    const brush = Array.from(bf.getElementsByTagName('*')).find((e) => e.localName === 'winBrush');
    const face = brush && brush.getAttribute('faceColor');
    fills[bf.getAttribute('id')] = [sides, face && face.toLowerCase() !== 'none' ? face.replace('#', '') : null];
  });
  return { chars, paras, fills };
}

// 열 폭(HWPUNIT). spans: [열 시작, 열 수, 폭, 행]. 한 칸짜리 칸을 먼저 쓰고, 여러 열에 걸친 칸은 남은 폭을 채운다.
function columnWidths(ncol, spans) {
  const known = {};
  spans.forEach(([c, cs, w]) => { if (cs === 1 && w && c < ncol && !(c in known)) known[c] = w; });
  let changed = true;
  while (changed) {
    changed = false;
    spans.forEach(([c, cs, w]) => {
      if (cs <= 1 || !w) return;
      const end = Math.min(c + cs, ncol);
      const unknown = [];
      for (let x = c; x < end; x++) if (!(x in known)) unknown.push(x);
      if (unknown.length === 1) {
        let used = 0;
        for (let x = c; x < end; x++) if (x in known) used += known[x];
        known[unknown[0]] = Math.max(w - used, 300);
        changed = true;
      }
    });
  }
  const unknownCols = [];
  for (let x = 0; x < ncol; x++) if (!(x in known)) unknownCols.push(x);
  if (unknownCols.length) {
    const rowSums = {};
    spans.forEach(([, , w, r]) => { rowSums[r] = (rowSums[r] || 0) + w; });
    const total = Math.max(1, ...Object.values(rowSums));
    const used = Object.values(known).reduce((a, b) => a + b, 0);
    const share = Math.max(Math.floor((total - used) / unknownCols.length), 300);
    unknownCols.forEach((x) => { known[x] = share; });
  }
  const out = [];
  for (let x = 0; x < ncol; x++) out.push(known[x]);
  return out;
}

// 그림을 미리 읽어 PNG로 바꾼다. 브라우저가 못 읽으면 원래 형식 그대로 둔다.
async function toPng(bytes, mime) {
  try {
    const bmp = await createImageBitmap(new Blob([bytes], { type: mime }));
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    canvas.getContext('2d').drawImage(bmp, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch (e) {
    return null;
  }
}
async function loadImages(z) {
  const map = new Map();
  for (const name of Object.keys(z.files)) {
    const m = /^BinData\/([^./]+)\.(\w+)$/.exec(name);
    if (!m) continue;
    const ext = m[2].toLowerCase() === 'jpg' ? 'jpeg' : m[2].toLowerCase();
    if (!IMG_TYPES[ext]) continue;
    const bytes = await z.file(name).async('uint8array');
    const png = await toPng(bytes, IMG_TYPES[ext]);
    map.set(m[1], png ? { bytes: png, ext: 'png' } : { bytes, ext });
  }
  return map;
}

class Converter {
  constructor(styles, images) {
    this.chars = styles.chars;
    this.paras = styles.paras;
    this.fills = styles.fills;
    this.images = images;
    this.imageRels = {};   // 그림 번호 -> 관계 번호
    this.media = [];       // {rid, bytes, ext}
    this.docpr = 0;
    this.warnings = [];    // {kind, message, near}
    this.lastText = '';    // 경고가 가리킬 근처 글
  }

  warn(kind, message) {
    this.warnings.push({ kind, message, near: this.lastText.slice(-30) });
  }

  checkFloat(el, what) {
    // 글자처럼 취급하지 않고, 글 옆으로 감싸거나 쪽·칸 기준으로 놓인 개체만 위험하다고 본다
    const pos = kid(el, 'pos');
    if (!pos || pos.getAttribute('treatAsChar') !== '0') return;
    const wrap = el.getAttribute('textWrap') || 'TOP_AND_BOTTOM';
    if (wrap === 'TOP_AND_BOTTOM' && pos.getAttribute('vertRelTo') === 'PARA') return;
    this.warn('floating', '글 옆으로 띄워진 ' + what + '(배치 ' + wrap + '): 변환 후 원본과 다른 자리에 나올 수 있습니다');
  }

  runXml(text, cs) {
    const size = cs.size || 20;
    const color = cs.color || '000000';
    const rpr = '<w:rPr><w:rFonts w:ascii="맑은 고딕" w:hAnsi="맑은 고딕" w:eastAsia="맑은 고딕"/>' +
      (cs.bold ? '<w:b/>' : '') + (cs.italic ? '<w:i/>' : '') +
      '<w:color w:val="' + color + '"/><w:sz w:val="' + size + '"/><w:szCs w:val="' + size + '"/></w:rPr>';
    const parts = cleanText(text).split('\n').map((line, i) =>
      (i ? '<w:br/>' : '') + '<w:t xml:space="preserve">' + xmlEsc(line) + '</w:t>');
    return '<w:r>' + rpr + parts.join('') + '</w:r>';
  }

  relFor(binId) {
    if (!(binId in this.imageRels)) {
      const img = this.images.get(binId);
      const rid = 'rIdImg' + (this.media.length + 1);
      this.media.push({ rid, bytes: img.bytes, ext: img.ext });
      this.imageRels[binId] = rid;
    }
    return this.imageRels[binId];
  }

  drawing(pic) {
    const img = Array.from(pic.getElementsByTagName('*')).find((e) => e.localName === 'img' && e.namespaceURI === NS_HC);
    const cur = kid(pic, 'curSz');
    if (!img || !cur) return '';
    const binId = img.getAttribute('binaryItemIDRef');
    if (!this.images.has(binId)) {
      this.warn('unsupported', '그림 파일을 읽지 못해 빠졌습니다');
      return '';
    }
    const rid = this.relFor(binId);
    const cx = parseInt(cur.getAttribute('width'), 10) * EMU;
    const cy = parseInt(cur.getAttribute('height'), 10) * EMU;
    this.docpr += 1;
    const n = this.docpr;
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/>' +
      '<wp:docPr id="' + n + '" name="그림 ' + n + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>' +
      '<pic:nvPicPr><pic:cNvPr id="' + n + '" name="image' + n + '.png"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
      '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  }

  paragraph(p) {
    const pp = this.paras[p.getAttribute('paraPrIDRef')] || 'JUSTIFY';
    const runs = [];   // 글 줄(문자열), 표({table})
    kids(p, 'run').forEach((run) => {
      const cs = this.chars[run.getAttribute('charPrIDRef')] || {};
      let buf = '';
      const flush = () => { if (buf) { runs.push(this.runXml(buf, cs)); buf = ''; } };
      Array.from(run.children).forEach((child) => {
        const tag = child.localName;
        if (tag === 't') {
          child.childNodes.forEach((node) => {
            if (node.nodeType === 3) {
              buf += node.textContent;
              if (node.textContent.trim()) this.lastText = node.textContent.trim();
            } else if (node.nodeType === 1) {
              if (node.localName === 'tab') buf += '\t';
              else if (node.localName === 'lineBreak' || node.localName === 'br') buf += '\n';
            }
          });
        } else if (tag === 'tbl') {
          flush();
          this.checkFloat(child, '표');
          runs.push({ table: child });
        } else if (tag === 'pic') {
          flush();
          this.checkFloat(child, '그림');
          const d = this.drawing(child);
          if (d) runs.push(d);
        } else if (UNSUPPORTED[tag]) {
          flush();
          this.warn('unsupported', UNSUPPORTED[tag] + ': 이 개체는 변환하지 못했습니다');
        }
      });
      flush();
    });
    const out = [];
    let cur = [];
    const emit = () => {
      if (cur.length) {
        out.push('<w:p><w:pPr><w:jc w:val="' + (JC[pp] || 'both') + '"/></w:pPr>' + cur.join('') + '</w:p>');
        cur = [];
      }
    };
    runs.forEach((r) => {
      if (typeof r === 'string') { cur.push(r); return; }
      emit();
      out.push(this.table(r.table));
      out.push('<w:p/>');
    });
    emit();
    return out.join('') || '<w:p/>';
  }

  body(paragraphs) {
    return paragraphs.map((p) => this.paragraph(p)).join('');
  }

  tcprBorders(bfId) {
    const [sides, face] = this.fills[bfId] || [{}, null];
    const side = (name) => {
      const s = sides[name];
      if (!s) return '<w:' + name + ' w:val="nil"/>';
      return '<w:' + name + ' w:val="' + s[0] + '" w:sz="' + s[1] + '" w:space="0" w:color="' + s[2] + '"/>';
    };
    const borders = '<w:tcBorders>' + side('top') + side('left') + side('bottom') + side('right') + '</w:tcBorders>';
    const shd = face ? '<w:shd w:val="clear" w:color="auto" w:fill="' + face + '"/>' : '';
    return borders + shd;
  }

  table(tbl) {
    const ncol = parseInt(tbl.getAttribute('colCnt') || '1', 10);
    const rows = kids(tbl, 'tr');
    const cells = new Map();   // "행,열" -> 칸
    const spans = [];
    rows.forEach((tr, r) => {
      kids(tr, 'tc').forEach((tc) => {
        const a = kid(tc, 'cellAddr'), s = kid(tc, 'cellSpan'), sz = kid(tc, 'cellSz');
        const c = parseInt(a.getAttribute('colAddr'), 10);
        const row = parseInt(a.getAttribute('rowAddr'), 10);
        const cs = parseInt(s.getAttribute('colSpan') || '1', 10);
        const rs = parseInt(s.getAttribute('rowSpan') || '1', 10);
        const w = parseInt(sz.getAttribute('width') || '0', 10);
        cells.set(row + ',' + c, { tc, c, cs, rs, w });
        spans.push([c, cs, w, row]);
      });
    });
    const gridTw = columnWidths(ncol, spans).map((w) => Math.max(Math.floor(w / 5), 300));
    for (const cell of cells.values()) {
      if (cell.tc.textContent.trim().length >= 10 && sumRange(gridTw, cell.c, cell.cs) < 800) {
        this.warn('narrow', '폭이 좁은 칸의 긴 글: 글자가 한 자씩 줄바꿈되어 원본과 모양이 다를 수 있습니다 (' + cell.tc.textContent.trim().slice(0, 12) + '…)');
        break;
      }
    }
    const occupied = new Set();
    const outRows = [];
    rows.forEach((_, r) => {
      const tcs = [];
      let c = 0;
      while (c < ncol) {
        const cell = cells.get(r + ',' + c);
        if (cell) {
          const tw = cell.w ? Math.floor(cell.w / 5) : sumRange(gridTw, c, cell.cs);
          let attrs = '<w:tcW w:w="' + tw + '" w:type="dxa"/>';
          if (cell.cs > 1) attrs += '<w:gridSpan w:val="' + cell.cs + '"/>';
          if (cell.rs > 1) {
            attrs += '<w:vMerge w:val="restart"/>';
            for (let rr = r + 1; rr < r + cell.rs; rr++) {
              for (let cc = c; cc < c + cell.cs; cc++) occupied.add(rr + ',' + cc);
            }
          }
          attrs += this.tcprBorders(cell.tc.getAttribute('borderFillIDRef'));
          const sub = kid(cell.tc, 'subList');
          const inner = sub ? this.body(kids(sub, 'p')) : '';
          tcs.push('<w:tc><w:tcPr>' + attrs + '</w:tcPr>' + (inner || '<w:p/>') + '</w:tc>');
          c += cell.cs;
        } else {
          if (occupied.has(r + ',' + c)) {
            tcs.push('<w:tc><w:tcPr><w:tcW w:w="' + (gridTw[c] || 300) + '" w:type="dxa"/><w:vMerge/></w:tcPr><w:p/></w:tc>');
          }
          c += 1;
        }
      }
      outRows.push('<w:tr>' + tcs.join('') + '</w:tr>');
    });
    const nil = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((b) => '<w:' + b + ' w:val="nil"/>').join('');
    return '<w:tbl><w:tblPr><w:tblW w:w="' + sumRange(gridTw, 0, gridTw.length) + '" w:type="dxa"/><w:tblBorders>' + nil +
      '</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>' +
      gridTw.map((w) => '<w:gridCol w:w="' + w + '"/>').join('') + '</w:tblGrid>' + outRows.join('') + '</w:tbl>';
  }
}

// hwpx 파일(ArrayBuffer) → { blob: docx, warnings: [...] }
export async function convertHwpxToDocx(arrayBuffer) {
  const z = await JSZip.loadAsync(arrayBuffer);
  const headerFile = z.file('Contents/header.xml');
  const secFile = z.file('Contents/section0.xml');
  if (!headerFile || !secFile) throw new Error('한글 파일 구조가 올바르지 않습니다.');
  const styles = loadStyles(parseXml(await headerFile.async('string')));
  const images = await loadImages(z);
  const sec = parseXml(await secFile.async('string'));
  const conv = new Converter(styles, images);
  const body = conv.body(kids(sec.documentElement, 'p'));

  const doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<w:document xmlns:w="' + W_NS + '" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
    'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>' + body +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr>' +
    '</w:body></w:document>';
  const exts = Array.from(new Set(conv.media.map((m) => m.ext)));
  const ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
    exts.map((e) => '<Default Extension="' + e + '" ContentType="' + IMG_TYPES[e] + '"/>').join('') +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  const drels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    conv.media.map((m) => '<Relationship Id="' + m.rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + m.rid + '.' + m.ext + '"/>').join('') +
    '</Relationships>';

  const out = new JSZip();
  // 폴더 항목 없이 파일만 넣는다 (폴더 항목이 있으면 한글·워드가 파일을 못 여는 경우가 있다)
  const opt = { createFolders: false };
  out.file('[Content_Types].xml', ct, opt);
  out.file('_rels/.rels', rels, opt);
  out.file('word/document.xml', doc, opt);
  out.file('word/_rels/document.xml.rels', drels, opt);
  conv.media.forEach((m) => out.file('word/media/' + m.rid + '.' + m.ext, m.bytes, opt));
  const blob = await out.generateAsync({ type: 'blob', mimeType: DOCX_MIME, compression: 'DEFLATE' });
  return { blob, warnings: conv.warnings };
}
