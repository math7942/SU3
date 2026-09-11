/* 수학문제 — 문제 생성·채점 엔진
 *
 * 각 과목 폴더의 data.js 가 window.SU3_SUBJECT 에 과목 정보를 담아 두면,
 * 이 파일이 #app 안에 영역·주제 목록과 문제 풀이 패널을 그립니다.
 *
 * data.js 에서 쓰는 문제 형식
 *   { q: '문제 HTML', type: 'num' | 'text' | 'choice',
 *     ans: 정답(숫자 · 문자열 · 보기 번호 0부터),
 *     ansText: '정답 표시 문자열(선택)', alt: ['허용 답안'](text 전용),
 *     choices: ['보기1', ...](choice 전용),
 *     unit: '단위(선택)', hint: '입력 안내(선택)', tol: 허용 오차(선택),
 *     sol: '해설 HTML' }
 */
(function () {
  'use strict';

  /* ---------- 문제를 만들 때 쓰는 도우미 ---------- */
  var M = {
    /* a 이상 b 이하의 정수 */
    i: function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); },
    /* 0 이 아닌 정수 */
    nz: function (a, b) { var v = 0; while (v === 0) { v = M.i(a, b); } return v; },
    /* 배열에서 하나 고르기 */
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    /* 섞은 새 배열 */
    shuffle: function (arr) {
      var r = arr.slice(), i, j, t;
      for (i = r.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        t = r[i]; r[i] = r[j]; r[j] = t;
      }
      return r;
    },
    /* 서로 다른 n개 뽑기 */
    sample: function (arr, n) { return M.shuffle(arr).slice(0, n); },
    /* 서로 다른 두 정수 */
    two: function (a, b) {
      var p = M.i(a, b), q = M.i(a, b);
      while (q === p) { q = M.i(a, b); }
      return [p, q];
    },
    gcd: function (a, b) {
      a = Math.abs(a); b = Math.abs(b);
      while (b) { var t = a % b; a = b; b = t; }
      return a || 1;
    },
    /* 기약분수 [분자, 분모] */
    frac: function (n, d) {
      if (d < 0) { n = -n; d = -d; }
      var g = M.gcd(n, d);
      return [n / g, d / g];
    },
    /* 기약분수를 TeX 로 */
    fracTex: function (n, d) {
      var f = M.frac(n, d);
      if (f[1] === 1) { return String(f[0]); }
      return (f[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}';
    },
    /* 기약분수를 3/4 꼴 문자열로 */
    fracStr: function (n, d) {
      var f = M.frac(n, d);
      return f[1] === 1 ? String(f[0]) : f[0] + '/' + f[1];
    },
    /* 계수와 문자를 합쳐 항으로 (1x -> x, -1x -> -x) */
    term: function (c, v) {
      if (!v) { return String(c); }
      if (c === 1) { return v; }
      if (c === -1) { return '-' + v; }
      return c + v;
    },
    /* [[계수, '문자'], ...] 를 다항식 문자열로 */
    poly: function (terms) {
      var s = '';
      terms.forEach(function (t) {
        var c = t[0], v = t[1];
        if (c === 0) { return; }
        if (s === '') { s = M.term(c, v); }
        else { s += (c < 0 ? ' - ' : ' + ') + M.term(Math.abs(c), v); }
      });
      return s === '' ? '0' : s;
    },
    /* 부호를 붙인 문자열 (+3, -3) */
    signed: function (c) { return (c < 0 ? '- ' : '+ ') + Math.abs(c); },
    fact: function (n) { var r = 1, i; for (i = 2; i <= n; i++) { r *= i; } return r; },
    nPr: function (n, r) { var v = 1, i; for (i = 0; i < r; i++) { v *= (n - i); } return v; },
    nCr: function (n, r) {
      if (r < 0 || r > n) { return 0; }
      r = Math.min(r, n - r);
      var v = 1, i;
      for (i = 1; i <= r; i++) { v = v * (n - r + i) / i; }
      return Math.round(v);
    },
    /* 소수점 자리를 정리한 숫자 문자열 */
    num: function (x, digits) {
      if (digits === undefined) { digits = 4; }
      var v = Number(x.toFixed(digits));
      return String(v);
    }
  };
  window.SU3M = M;

  /* ---------- 답 비교 ---------- */
  function parseNumber(raw) {
    var s = String(raw).replace(/\s+/g, '').replace(/,/g, '');
    if (!s) { return null; }
    s = s.replace(/^\+/, '');
    var m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (m) {
      var d = parseFloat(m[2]);
      if (!d) { return null; }
      return parseFloat(m[1]) / d;
    }
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) { return null; }
    return parseFloat(s);
  }

  function normalizeText(raw) {
    return String(raw)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[,，]/g, '')
      .replace(/[×·*]/g, '*')
      .replace(/[（(]/g, '(')
      .replace(/[）)]/g, ')');
  }

  function answerText(p) {
    if (p.ansText) { return p.ansText; }
    if (p.type === 'choice') { return '(' + (p.ans + 1) + ') ' + p.choices[p.ans]; }
    if (p.type === 'num') { return M.num(p.ans); }
    return String(p.ans);
  }

  /* ---------- 점수 저장 ---------- */
  function storeKey(subjectId, topicId) { return 'su3-problems:' + subjectId + ':' + topicId; }

  function loadScore(subjectId, topicId) {
    try {
      var raw = localStorage.getItem(storeKey(subjectId, topicId));
      if (!raw) { return { right: 0, total: 0 }; }
      var v = JSON.parse(raw);
      return { right: v.right || 0, total: v.total || 0 };
    } catch (e) { return { right: 0, total: 0 }; }
  }

  function saveScore(subjectId, topicId, score) {
    try { localStorage.setItem(storeKey(subjectId, topicId), JSON.stringify(score)); } catch (e) { /* 저장 못 해도 문제 풀이는 계속 */ }
  }

  /* ---------- 수식 다시 그리기 ---------- */
  function typeset(el) {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([el]).catch(function () { /* 수식 오류는 무시 */ });
    }
  }

  /* ---------- 화면 그리기 ---------- */
  function init() {
    var S = window.SU3_SUBJECT;
    var app = document.getElementById('app');
    if (!S || !app) { return; }

    var topics = [];
    S.areas.forEach(function (area) {
      area.topics.forEach(function (t) {
        t.area = area.name;
        topics.push(t);
      });
    });

    var state = { topic: null, problem: null, checked: false, selected: null, random: false };

    /* 주제 목록 */
    var nav = document.createElement('div');
    S.areas.forEach(function (area) {
      var block = document.createElement('div');
      block.className = 'area-block';
      var h = document.createElement('h2');
      h.textContent = area.name;
      block.appendChild(h);
      var grid = document.createElement('div');
      grid.className = 'topic-nav';
      area.topics.forEach(function (t) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'topic-btn';
        b.dataset.topic = t.id;
        b.innerHTML = '<span class="t-name"></span><span class="t-desc"></span><span class="t-score"></span>';
        b.querySelector('.t-name').innerHTML = t.name;
        b.querySelector('.t-desc').innerHTML = t.desc || '';
        b.addEventListener('click', function () { start(t, false); });
        grid.appendChild(b);
      });
      block.appendChild(grid);
      nav.appendChild(block);
    });

    /* 무작위 출제 */
    var randomRow = document.createElement('div');
    randomRow.className = 'btn-row';
    var randomBtn = document.createElement('button');
    randomBtn.type = 'button';
    randomBtn.className = 'btn';
    randomBtn.textContent = '🎲 전체 주제에서 무작위 출제';
    randomBtn.addEventListener('click', function () { start(M.pick(topics), true); });
    randomRow.appendChild(randomBtn);

    /* 문제 패널 */
    var panel = document.createElement('section');
    panel.className = 'panel';
    panel.id = 'panel';
    panel.hidden = true;

    app.appendChild(nav);
    app.appendChild(randomRow);
    app.appendChild(panel);

    updateScores();
    typeset(nav);

    function updateScores() {
      topics.forEach(function (t) {
        var b = nav.querySelector('.topic-btn[data-topic="' + t.id + '"] .t-score');
        if (!b) { return; }
        var s = loadScore(S.id, t.id);
        b.textContent = s.total ? '푼 문제 ' + s.total + '개 · 정답 ' + s.right + '개' : '';
      });
    }

    function markCurrent(topic) {
      Array.prototype.forEach.call(nav.querySelectorAll('.topic-btn'), function (b) {
        b.classList.toggle('current', !state.random && b.dataset.topic === topic.id);
      });
    }

    function start(topic, random) {
      state.random = !!random;
      state.topic = topic;
      markCurrent(topic);
      newProblem();
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function newProblem() {
      if (state.random) { state.topic = M.pick(topics); }
      var topic = state.topic;
      var p;
      try {
        p = topic.gen();
      } catch (e) {
        p = { q: '문제를 만드는 중 오류가 발생했습니다.', type: 'text', ans: '', sol: '' };
      }
      state.problem = p;
      state.checked = false;
      state.selected = null;
      render();
    }

    function render() {
      var topic = state.topic;
      var p = state.problem;
      var score = loadScore(S.id, topic.id);

      panel.innerHTML = '';

      var head = document.createElement('div');
      head.className = 'panel-head';
      head.innerHTML =
        '<div><h2></h2><p class="where"></p></div>' +
        '<span class="score"></span>';
      head.querySelector('h2').innerHTML = topic.name;
      head.querySelector('.where').textContent =
        topic.area + (state.random ? ' · 무작위 출제 중' : '');
      /* 주제 이름에 수식이 들어갈 수 있으므로 패널 전체를 다시 조판합니다. */
      head.querySelector('.score').textContent =
        '이 주제 기록 ' + score.right + ' / ' + score.total;
      panel.appendChild(head);

      if (topic.concept) {
        var c = document.createElement('div');
        c.className = 'concept';
        c.innerHTML = '<h3>개념 정리</h3>' + topic.concept;
        panel.appendChild(c);
      }

      var qno = document.createElement('p');
      qno.className = 'q-no';
      qno.textContent = '문제';
      panel.appendChild(qno);

      var q = document.createElement('div');
      q.className = 'q-body';
      q.innerHTML = p.q;
      panel.appendChild(q);

      var answerArea = document.createElement('div');
      if (p.type === 'choice') {
        answerArea.className = 'choices';
        p.choices.forEach(function (text, idx) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'choice';
          b.innerHTML = '<span class="num">' + (idx + 1) + '</span><span class="txt"></span>';
          b.querySelector('.txt').innerHTML = text;
          b.addEventListener('click', function () {
            if (state.checked) { return; }
            state.selected = idx;
            Array.prototype.forEach.call(answerArea.children, function (el, i) {
              el.classList.toggle('sel', i === idx);
            });
          });
          answerArea.appendChild(b);
        });
      } else {
        answerArea.className = 'answer-row';
        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'answer-input';
        input.autocomplete = 'off';
        input.placeholder = p.type === 'num' ? '답을 숫자로 입력 (분수는 3/4)' : '답을 입력하세요';
        input.addEventListener('keydown', function (ev) {
          if (ev.key !== 'Enter') { return; }
          ev.preventDefault();
          if (state.checked) { newProblem(); } else { check(); }
        });
        answerArea.appendChild(input);
        if (p.unit) {
          var u = document.createElement('span');
          u.className = 'unit';
          u.textContent = p.unit;
          answerArea.appendChild(u);
        }
      }
      panel.appendChild(answerArea);

      if (p.hint) {
        var hint = document.createElement('p');
        hint.className = 'hint';
        hint.textContent = p.hint;
        panel.appendChild(hint);
      }

      var fb = document.createElement('div');
      fb.id = 'feedback';
      panel.appendChild(fb);

      var sol = document.createElement('div');
      sol.id = 'solution';
      panel.appendChild(sol);

      var row = document.createElement('div');
      row.className = 'btn-row';

      var checkBtn = document.createElement('button');
      checkBtn.type = 'button';
      checkBtn.className = 'btn';
      checkBtn.textContent = '채점하기';
      checkBtn.addEventListener('click', check);

      var solBtn = document.createElement('button');
      solBtn.type = 'button';
      solBtn.className = 'btn secondary';
      solBtn.textContent = '해설 보기';
      solBtn.addEventListener('click', function () { showSolution(true); });

      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn secondary';
      nextBtn.textContent = '다음 문제';
      nextBtn.addEventListener('click', newProblem);

      var resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'reset-link';
      resetBtn.textContent = '이 주제 기록 지우기';
      resetBtn.addEventListener('click', function () {
        saveScore(S.id, topic.id, { right: 0, total: 0 });
        updateScores();
        head.querySelector('.score').textContent = '이 주제 기록 0 / 0';
      });

      row.appendChild(checkBtn);
      row.appendChild(solBtn);
      row.appendChild(nextBtn);
      row.appendChild(resetBtn);
      panel.appendChild(row);

      typeset(panel);
      var el = panel.querySelector('#answer-input');
      if (el) { el.focus({ preventScroll: true }); }
    }

    function check() {
      if (state.checked) { return; }
      var p = state.problem;
      var fb = panel.querySelector('#feedback');
      var ok;

      if (p.type === 'choice') {
        if (state.selected === null) {
          fb.className = 'feedback warn';
          fb.textContent = '보기를 하나 고른 뒤 채점해 주세요.';
          return;
        }
        ok = state.selected === p.ans;
      } else if (p.type === 'num') {
        var input = panel.querySelector('#answer-input');
        var v = parseNumber(input.value);
        if (v === null) {
          fb.className = 'feedback warn';
          fb.textContent = '숫자로 답을 입력해 주세요. 분수는 3/4, 소수는 0.75 처럼 씁니다.';
          return;
        }
        var tol = p.tol === undefined ? 1e-6 : p.tol;
        ok = Math.abs(v - p.ans) <= Math.max(tol, Math.abs(p.ans) * 1e-9);
      } else {
        var inputT = panel.querySelector('#answer-input');
        if (!inputT.value.trim()) {
          fb.className = 'feedback warn';
          fb.textContent = '답을 입력한 뒤 채점해 주세요.';
          return;
        }
        var got = normalizeText(inputT.value);
        var list = [p.ans].concat(p.alt || []);
        ok = list.some(function (a) { return normalizeText(a) === got; });
      }

      state.checked = true;
      var score = loadScore(S.id, state.topic.id);
      score.total += 1;
      if (ok) { score.right += 1; }
      saveScore(S.id, state.topic.id, score);
      updateScores();
      panel.querySelector('.score').textContent = '이 주제 기록 ' + score.right + ' / ' + score.total;

      if (p.type === 'choice') {
        Array.prototype.forEach.call(panel.querySelectorAll('.choice'), function (el, i) {
          el.classList.toggle('sel', i === p.ans);
        });
      }

      fb.className = 'feedback ' + (ok ? 'ok' : 'no');
      fb.innerHTML = ok
        ? '정답입니다. 잘했어요!'
        : '아쉽습니다. 정답은 <strong>' + answerText(p) + '</strong> 입니다.';
      typeset(fb);
      showSolution(false);
    }

    function showSolution(countAsGiveUp) {
      var p = state.problem;
      var box = panel.querySelector('#solution');
      if (!box || box.dataset.shown === '1') { return; }
      box.dataset.shown = '1';
      box.className = 'solution';
      box.innerHTML = '<h3>해설</h3>' +
        (p.sol || '<p>차근차근 식을 세워 계산해 보세요.</p>') +
        '<p><strong>답: ' + answerText(p) + '</strong></p>';
      typeset(box);

      if (countAsGiveUp && !state.checked) {
        state.checked = true;
        var score = loadScore(S.id, state.topic.id);
        score.total += 1;
        saveScore(S.id, state.topic.id, score);
        updateScores();
        panel.querySelector('.score').textContent = '이 주제 기록 ' + score.right + ' / ' + score.total;
        var fb = panel.querySelector('#feedback');
        fb.className = 'feedback warn';
        fb.textContent = '해설을 먼저 보았습니다. 다음 문제로 스스로 확인해 보세요.';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
