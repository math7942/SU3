/* 쪽지시험 출력 화면 (window.SU3Sheets)
 *
 * 주제에 sheet 가 달려 있으면 problems.js 가 이 파일의 mount() 를 불러 패널을 맡깁니다.
 * - 한 번에 A~D 4세트를 만들어 보여 주고(미리보기), 학생용/교사용을 A4 용지로 인쇄합니다.
 * - 인쇄는 화면 밖에 있는 #print-root 에 시험지 쪽을 쌓아 두고 window.print() 로 내보냅니다.
 */
(function () {
  'use strict';

  var FORMS = ['A', 'B', 'C', 'D'];

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* 한 줄 수식. 큰 적분 기호와 분수를 위해 displaystyle 로 씁니다. */
  function m(tex) { return '<span class="m">\\(\\displaystyle ' + esc(tex) + '\\)</span>'; }

  /* 긴 풀이 줄을 줄바꿈할 수 있도록 최상위의 ⇒ , \quad , "," 에서 여러 덩어리로 자릅니다.
   * (중괄호·\left…\right 안쪽은 자르지 않습니다.) */
  function chunkTex(tex) {
    var out = [], cur = '', depth = 0, i = 0;
    function flush() { if (cur.replace(/\\ /g, '').trim()) { out.push(cur); } cur = ''; }
    while (i < tex.length) {
      if (tex.indexOf('\\left', i) === i) { depth++; cur += '\\left'; i += 5; continue; }
      if (tex.indexOf('\\right', i) === i) { depth--; cur += '\\right'; i += 6; continue; }
      var ch = tex.charAt(i);
      if (ch === '{') { depth++; } else if (ch === '}') { depth--; }
      if (depth === 0) {
        if (tex.indexOf('\\Rightarrow', i) === i) { flush(); cur = '\\Rightarrow'; i += 11; continue; }
        if (tex.indexOf('\\quad', i) === i) { flush(); i += 5; continue; }
        if (tex.indexOf(',\\ ', i) === i) { cur += ','; flush(); i += 3; continue; }
      }
      cur += ch;
      i++;
    }
    flush();
    return out;
  }
  function mChunks(tex) { return chunkTex(tex).map(m).join(' '); }

  /* ---------- 시험지 한 쪽 만들기 ---------- */
  function header(sheet, mode, set, teacher, pageTag) {
    return '<header class="sh-head">' +
      '<div class="sh-titlebar"><h2>' + esc(sheet.title) + (mode.sub ? '<span class="sh-sub">' + esc(mode.sub) + '</span>' : '') + '</h2>' +
      '<span class="sh-form">' + set.label + '형</span>' +
      (teacher ? '<span class="sh-key">교사용 정답' + (pageTag ? ' ' + pageTag : '') + '</span>' : '') + '</div>' +
      '<div class="sh-id">학년<i></i>반<i></i>번 이름<i class="wide"></i>점수<i></i>/ ' + sheet.total + '</div>' +
      '</header>' + (sheet.note ? '<p class="sh-note">' + esc(sheet.note) + '</p>' : '');
  }
  function footer(set, pageTag) {
    return '<footer class="sh-foot">' + set.label + '형' + (pageTag ? ' (' + pageTag + ')' : '') + '</footer>';
  }

  /* 풀이 줄들 */
  function solBlock(lines) {
    return '<div class="qsol"><span class="tag">풀이</span><div class="lines">' +
      lines.map(function (l) { return '<div>' + mChunks(l) + '</div>'; }).join('') + '</div></div>';
  }
  function ansLine(a) { return '<div class="qans"><span class="tag">답</span><span class="red">' + m(a) + '</span></div>'; }

  /* --- 공식 쪽지시험 --- */
  function pageFormula(sheet, mode, set, teacher) {
    function rows(list, startNo, total) {
      var html = list.map(function (it, i) {
        return '<div class="frow fit"><span class="no">' + (startNo + i) + '.</span>' +
          (it.pre ? '<span class="fpre">' + it.pre + '</span>' : '') +
          '<span class="fq">' + m(it.q + '=') + '</span>' +
          (teacher ? '<span class="fa red">' + m(it.a) + '</span>' : '') + '</div>';
      }).join('');
      for (var i = list.length; i < total; i++) { html += '<div class="frow empty"></div>'; }
      return html;
    }
    return '<section class="sheet sheet-formula' + (teacher ? ' is-key' : '') + '">' +
      header(sheet, mode, set, teacher) +
      '<div class="fcols">' +
      '<div class="fcol"><h3>미분 공식</h3><div class="frows">' + rows(set.left, 1, 16) + '</div></div>' +
      '<div class="fcol"><h3>적분 공식</h3><div class="frows">' + rows(set.right, set.left.length + 1, 16) + '</div></div>' +
      '</div>' + footer(set) + '</section>';
  }

  /* --- 치환적분 · 부분적분 (2열 × 5행) --- */
  function cellQuiz(it, no, teacher) {
    var body;
    if (it.parts && it.tagged) {
      body = '<div class="qq">' + m(it.parts[0].q + '=') + '</div>' + (teacher ? ansLine(it.parts[0].a) : '');
    } else if (it.parts) {
      body = it.parts.map(function (p) {
        return '<div class="qq">' + m(p.q + '=') + (teacher ? '<span class="red">' + m(p.a) + '</span>' : '') + '</div>';
      }).join('');
    } else {
      body = '<div class="qq">' + m(it.q + '=') + '</div>' +
        (teacher ? ansLine(it.a) + solBlock(it.sol) : '');
    }
    return '<div class="qcell fit"><span class="no">' + no + '.</span><div class="qbody">' + body + '</div></div>';
  }
  function pageQuiz(sheet, mode, set, teacher) {
    var left = '', right = '';
    set.items.forEach(function (it, i) {
      var cell = cellQuiz(it, i + 1, teacher);
      if (i < 5) { left += cell; } else { right += cell; }
    });
    return '<section class="sheet sheet-quiz' + (teacher ? ' is-key' : '') + '">' +
      header(sheet, mode, set, teacher) +
      '<div class="qgrid"><div class="qcol">' + left + '</div><div class="qcol">' + right + '</div></div>' +
      footer(set) + '</section>';
  }

  /* --- 정적분과 급수의 합 --- */
  function ansBlock(it) {
    return '<div class="s-ans"><div class="a1"><span class="tag">답</span><span class="red">' + m(it.a) + '</span></div>' +
      '<div class="a2"><span class="tag">풀이</span><div class="lines">' +
      it.sol.map(function (l) { return '<div>' + mChunks(l) + '</div>'; }).join('') + '</div></div></div>';
  }
  function pagesSeries(sheet, mode, set, teacher) {
    var items = set.items, html;
    if (!teacher) {
      var cell = function (i) {
        return '<div class="s-cell fit"><span class="no">' + (i + 1) + '.</span><span class="sq">' + m(items[i].q + '=') + '</span></div>';
      };
      var col = function (a) { return '<div class="s-col">' + cell(a) + cell(a + 1) + cell(a + 2) + '</div>'; };
      var rows = '';
      for (var i = 6; i < 10; i++) {
        rows += '<div class="s-row fit"><span class="no">' + (i + 1) + '.</span><span class="sq">' + m(items[i].q + '=') + '</span></div>';
      }
      return ['<section class="sheet sheet-series">' + header(sheet, mode, set, false) +
        '<div class="s-top">' + col(0) + col(3) + '</div><div class="s-rows">' + rows + '</div>' +
        footer(set) + '</section>'];
    }
    function keyPage(from, to, tag) {
      var rows = '';
      for (var j = from; j < to; j++) {
        var it = items[j];
        rows += '<div class="t-row fit' + (it.wide ? ' wide' : '') + '">' +
          '<div class="t-q"><span class="no">' + (j + 1) + '.</span><span class="sq">' + m(it.q + '=') + '</span></div>' +
          ansBlock(it) + '</div>';
      }
      return '<section class="sheet sheet-series is-key">' + header(sheet, mode, set, true, tag) +
        '<div class="t-rows">' + rows + '</div>' + footer(set, tag) + '</section>';
    }
    html = [keyPage(0, 5, '1/2'), keyPage(5, 10, '2/2')];
    return html;
  }

  /* 한 세트가 만들어 내는 쪽들 (HTML 문자열 배열) */
  function pagesOf(sheet, mode, set, teacher) {
    if (sheet.layout === 'formula') { return [pageFormula(sheet, mode, set, teacher)]; }
    if (sheet.layout === 'quiz') { return [pageQuiz(sheet, mode, set, teacher)]; }
    return pagesSeries(sheet, mode, set, teacher);
  }

  /* ---------- 수식 조판 ---------- */
  function typesetAsync(el) {
    var mj = window.MathJax;
    if (!mj || !mj.typesetPromise) { return Promise.resolve(); }
    var ready = mj.startup && mj.startup.promise ? mj.startup.promise : Promise.resolve();
    return ready.then(function () { return mj.typesetPromise([el]); }).catch(function () { /* 수식 오류는 무시 */ });
  }

  /* 칸을 넘치는 줄은 글자 크기를 줄여 칸 안에 넣습니다. (가로·세로 모두) */
  function fitAll(root) {
    var els = root.querySelectorAll('.fit');
    var pass, i, el, r;
    for (pass = 0; pass < 3; pass++) {
      var changed = false;
      for (i = 0; i < els.length; i++) {
        el = els[i];
        r = 1;
        if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) { r = Math.min(r, el.clientWidth / el.scrollWidth); }
        if (el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 1) { r = Math.min(r, el.clientHeight / el.scrollHeight); }
        if (r < 0.995) {
          var px = parseFloat(window.getComputedStyle(el).fontSize);
          el.style.fontSize = (px * Math.max(0.55, r * 0.97)) + 'px';
          changed = true;
        }
      }
      if (!changed) { break; }
    }
  }
  function settle(el) {
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return typesetAsync(el).then(function () { return fonts; }).then(function () {
      return new Promise(function (res) { window.requestAnimationFrame(function () { fitAll(el); res(); }); });
    });
  }

  /* ---------- 인쇄용 숨은 영역 ---------- */
  function printRoot() {
    var el = document.getElementById('print-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'print-root';
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    return el;
  }

  function printSets(sheet, mode, sets, teacher) {
    var root = printRoot();
    var title = document.title;
    root.innerHTML = sets.map(function (s) { return pagesOf(sheet, mode, s, teacher).join(''); }).join('');
    settle(root).then(function () {
      document.body.classList.add('sheet-printing');
      document.title = sheet.title + (mode.sub ? ' ' + mode.sub : '') + (teacher ? ' 교사용' : ' 학생용');
      var done = function () {
        document.body.classList.remove('sheet-printing');
        document.title = title;
        window.removeEventListener('afterprint', done);
      };
      window.addEventListener('afterprint', done);
      /* 레이아웃이 자리를 잡을 시간을 조금 준 뒤 인쇄 창을 엽니다. */
      setTimeout(function () { window.print(); }, 120);
    });
  }

  /* ---------- 패널 ---------- */
  function mount(panel, topic, ctx) {
    var sheet = topic.sheet;
    var state = { mode: sheet.modes[0], sets: null, cur: 0, key: false };

    panel.innerHTML = '';
    panel.className = 'panel panel-sheet';

    var head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = '<div><h2></h2><p class="where"></p></div><span class="score">A~D 4세트 · A4 인쇄용</span>';
    head.querySelector('h2').innerHTML = topic.name;
    head.querySelector('.where').textContent = topic.area;
    panel.appendChild(head);

    if (topic.concept) {
      var c = document.createElement('div');
      c.className = 'concept';
      c.innerHTML = '<h3>이 시험지는</h3>' + topic.concept;
      panel.appendChild(c);
      typesetAsync(c);
    }

    var tools = document.createElement('div');
    tools.className = 'sheet-tools';
    panel.appendChild(tools);

    if (sheet.modes.length > 1) {
      var sw = document.createElement('div');
      sw.className = 'mode-switch';
      sw.setAttribute('role', 'group');
      sw.setAttribute('aria-label', '유형 선택');
      sheet.modes.forEach(function (md) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = md.label;
        b.dataset.mode = md.id;
        b.addEventListener('click', function () { state.mode = md; generate(); });
        sw.appendChild(b);
      });
      tools.appendChild(sw);
    }

    function btn(label, cls, fn) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn ' + cls;
      b.textContent = label;
      b.addEventListener('click', fn);
      tools.appendChild(b);
      return b;
    }
    btn('🔄 새 문제 4세트 만들기', '', function () { generate(); });
    btn('🖨 학생용 인쇄 (A~D)', 'secondary', function () { printSets(sheet, state.mode, state.sets, false); });
    btn('🖨 교사용 정답 인쇄 (A~D)', 'secondary', function () { printSets(sheet, state.mode, state.sets, true); });

    var hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = '인쇄 창에서 용지는 A4, 배율은 100%(기본값)로 두세요. 학생용과 교사용 정답은 화면에 보이는 같은 4세트로 만들어지므로, 문제를 바꾸고 싶을 때만 "새 문제 4세트 만들기"를 누르세요.';
    panel.appendChild(hint);

    var bar = document.createElement('div');
    bar.className = 'sheet-tabs';
    var tabs = document.createElement('div');
    tabs.className = 'tabs';
    FORMS.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = f + '형';
      b.dataset.idx = i;
      b.addEventListener('click', function () { state.cur = i; renderPreview(); });
      tabs.appendChild(b);
    });
    bar.appendChild(tabs);
    var keyLabel = document.createElement('label');
    keyLabel.className = 'key-toggle';
    var keyBox = document.createElement('input');
    keyBox.type = 'checkbox';
    keyBox.addEventListener('change', function () { state.key = keyBox.checked; renderPreview(); });
    keyLabel.appendChild(keyBox);
    keyLabel.appendChild(document.createTextNode(' 정답·풀이 보기'));
    bar.appendChild(keyLabel);
    panel.appendChild(bar);

    var scrollHint = document.createElement('p');
    scrollHint.className = 'hint scroll-hint';
    scrollHint.textContent = '← 시험지 미리보기는 좌우로 밀어서 볼 수 있습니다 →';
    panel.appendChild(scrollHint);

    var viewport = document.createElement('div');
    viewport.className = 'sheet-viewport';
    panel.appendChild(viewport);

    function renderPreview() {
      Array.prototype.forEach.call(tabs.children, function (b, i) { b.classList.toggle('current', i === state.cur); });
      Array.prototype.forEach.call(tools.querySelectorAll('.mode-switch button'), function (b) {
        b.classList.toggle('current', b.dataset.mode === state.mode.id);
      });
      viewport.innerHTML = pagesOf(sheet, state.mode, state.sets[state.cur], state.key).join('');
      settle(viewport);
    }

    function generate() {
      state.sets = sheet.build(state.mode.id);
      state.cur = 0;
      renderPreview();
    }

    generate();
  }

  window.SU3Sheets = { mount: mount, pagesOf: pagesOf };
})();
