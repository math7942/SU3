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

    /* 한 문제씩 푸는 주제만 무작위 출제와 기록 저장 대상입니다. 쪽지시험(sheet)은 인쇄용입니다. */
    var practice = topics.filter(function (t) { return !t.sheet; });

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
        b.className = 'topic-btn' + (t.sheet ? ' is-sheet' : '');
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
    randomBtn.addEventListener('click', function () { start(M.pick(practice), true); });
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
        if (t.sheet) { b.textContent = '🖨 A~D 4세트 · 인쇄용'; return; }
        var s = loadScore(S.id, t.id);
        b.textContent = s.total ? '푼 문제 ' + s.total + '개 · 정답 ' + s.right + '개' : '';
      });
    }

    function markCurrent(topic) {
      Array.prototype.forEach.call(nav.querySelectorAll('.topic-btn'), function (b) {
        b.classList.toggle('current', !state.random && b.dataset.topic === topic.id);
      });
    }

    /* ---------- 답안 제출 (S.submit 이 true 인 과목만) ---------- */
    var submitOn = !!S.submit;
    var me = null;
    var submitReady = false;
    var bar = null;
    var mine = null;
    if (submitOn) { mountSubmit(); }

    function esc(str) {
      var d = document.createElement('div');
      d.textContent = str == null ? '' : String(str);
      return d.innerHTML;
    }

    function getStudentId() {
      var el = bar && bar.querySelector('#student-id');
      var v = el ? el.value.trim() : '';
      try { if (v) { localStorage.setItem('su3-student-id', v); } } catch (e) { /* 무시 */ }
      return v;
    }

    function mountSubmit() {
      bar = document.createElement('div');
      bar.className = 'panel submit-bar';
      app.parentNode.insertBefore(bar, app);
      mine = document.createElement('div');
      mine.className = 'panel my-submissions';
      mine.hidden = true;
      app.parentNode.insertBefore(mine, app.nextSibling);
      drawBar();

      function wire() {
        submitReady = true;
        window.SU3Submit.onAuth(function (user, err) {
          if (err) { bar.innerHTML = '<p class="notice">로그인 기능을 불러오지 못했습니다. 페이지를 새로고침해 주세요.</p>'; return; }
          me = user;
          drawBar();
          var stop = mine._stop; if (stop) { stop(); mine._stop = null; }
          if (user) {
            mine._stop = window.SU3Submit.listMine(drawMine);
          } else {
            mine.hidden = true;
          }
        });
      }
      if (window.SU3Submit) { wire(); } else { document.addEventListener('su3submit-ready', wire); }
    }

    function drawBar() {
      if (!bar) { return; }
      var prevId = '';
      var old = bar.querySelector('#student-id');
      if (old) { prevId = old.value; }
      if (!prevId) { try { prevId = localStorage.getItem('su3-student-id') || ''; } catch (e) { /* 무시 */ } }
      if (me) {
        bar.innerHTML =
          '<div class="submit-row"><span class="submit-who"><strong>' + esc(S.name) + '</strong> · ' + esc(me.email || me.displayName || '') + '</span>' +
          '<label class="submit-id">학번 <input id="student-id" type="text" maxlength="20" autocomplete="off" placeholder="예: 10101"></label>' +
          '<button type="button" class="reset-link" id="logout-btn">로그아웃</button></div>' +
          '<p class="hint">채점한 뒤 &lsquo;선생님께 제출&rsquo;을 누르면 선생님이 풀이를 확인하고 피드백을 써 줍니다.</p>';
        bar.querySelector('#student-id').value = prevId;
        bar.querySelector('#logout-btn').addEventListener('click', function () { window.SU3Submit.logout(); });
      } else {
        bar.innerHTML =
          '<div class="submit-row"><span class="submit-who">선생님께 답안을 제출하려면 구글 계정으로 로그인하세요.</span>' +
          '<button type="button" class="btn" id="login-btn">구글로 로그인</button></div>' +
          '<p class="hint">로그인하지 않아도 문제 풀이와 채점은 그대로 할 수 있습니다.</p>';
        bar.querySelector('#login-btn').addEventListener('click', function () {
          if (!window.SU3Submit) { return; }
          window.SU3Submit.login().catch(function (e) {
            alert('로그인하지 못했습니다. (' + (e && e.code ? e.code : '알 수 없는 오류') + ')');
          });
        });
      }
    }

    function drawMine(list, err) {
      if (err) { mine.hidden = false; mine.innerHTML = '<p class="notice">제출 내역을 불러오지 못했습니다.</p>'; return; }
      mine.hidden = false;
      var html = '<div class="panel-head"><div><h2>내 제출 · 선생님 피드백</h2><p class="where">' + list.length + '개 제출</p></div></div>';
      if (!list.length) {
        html += '<p class="hint">아직 제출한 답안이 없습니다.</p>';
      }
      list.forEach(function (r) {
        var d = new Date(r.createdAt);
        html += '<div class="sub-item">' +
          '<div class="sub-top"><strong>' + esc(r.topicName) + '</strong><span class="sub-time">' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.toLocaleTimeString('ko-KR') + '</span></div>' +
          '<details><summary>문제 보기</summary><div class="q-body">' + window.SU3Submit.safeHtml(r.problemHtml) + '</div></details>' +
          '<p class="sub-line">내 답: <strong>' + esc(r.studentAnswer || '(없음)') + '</strong> · ' +
          (r.correct === true ? '<span class="ok-text">정답</span>' : '<span class="no-text">오답</span>') + '</p>' +
          (r.feedback
            ? '<div class="sub-feedback"><strong>선생님 피드백</strong><p>' + esc(r.feedback).replace(/\n/g, '<br>') + '</p></div>'
            : '<p class="hint">아직 피드백이 없습니다.</p>') +
          '</div>';
      });
      mine.innerHTML = html;
      typeset(mine);
    }

    function submitCurrent(btn, fb) {
      if (!me) { fb.className = 'feedback warn'; fb.textContent = '먼저 위에서 구글로 로그인해 주세요.'; return; }
      var sid = getStudentId();
      if (!sid) { fb.className = 'feedback warn'; fb.textContent = '위쪽 칸에 학번을 입력해 주세요.'; return; }
      var p = state.problem;
      var r = state.result || { ok: false, answer: '' };
      btn.disabled = true;
      btn.textContent = '제출 중…';
      window.SU3Submit.submit({
        studentId: sid.slice(0, 20),
        subjectId: S.id,
        subjectName: S.name,
        topicId: state.topic.id,
        topicName: String(state.topic.name).slice(0, 200),
        problemHtml: String(p.q).slice(0, 20000),
        studentAnswer: String(r.answer).slice(0, 500),
        correctAnswer: answerText(p).slice(0, 500),
        correct: !!r.ok
      }).then(function () {
        btn.textContent = '제출 완료';
        state.submitted = true;
      }).catch(function (e) {
        console.error(e);
        btn.disabled = false;
        btn.textContent = '선생님께 제출';
        fb.className = 'feedback warn';
        fb.textContent = '제출하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';
      });
    }

    function start(topic, random) {
      state.random = !!random;
      state.topic = topic;
      markCurrent(topic);
      if (topic.sheet) {
        openSheet(topic);
      } else {
        newProblem();
      }
      panel.hidden = false;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function openSheet(topic) {
      if (!window.SU3Sheets) {
        panel.className = 'panel';
        panel.innerHTML = '<p class="notice">쪽지시험 출력 기능을 불러오지 못했습니다. 페이지를 새로고침해 주세요.</p>';
        return;
      }
      window.SU3Sheets.mount(panel, topic, { typeset: typeset, subject: S });
    }

    function newProblem() {
      if (state.random) { state.topic = M.pick(practice); }
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
      state.result = null;
      state.submitted = false;
      render();
    }

    function render() {
      var topic = state.topic;
      var p = state.problem;
      var score = loadScore(S.id, topic.id);

      panel.innerHTML = '';
      panel.className = 'panel';

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
      if (submitOn) {
        var subBtn = document.createElement('button');
        subBtn.type = 'button';
        subBtn.id = 'submit-btn';
        subBtn.className = 'btn';
        subBtn.textContent = state.submitted ? '제출 완료' : '선생님께 제출';
        subBtn.disabled = state.submitted || !state.checked;
        subBtn.title = '먼저 채점하기를 눌러 주세요';
        subBtn.addEventListener('click', function () { submitCurrent(subBtn, panel.querySelector('#feedback')); });
        row.appendChild(subBtn);
      }
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
      state.result = {
        ok: ok,
        answer: p.type === 'choice'
          ? '(' + (state.selected + 1) + ') ' + p.choices[state.selected]
          : panel.querySelector('#answer-input').value.trim()
      };
      var subNow = panel.querySelector('#submit-btn');
      if (subNow && !state.submitted) { subNow.disabled = false; }
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
        state.result = { ok: false, answer: '(해설을 먼저 봄)' };
        var subGive = panel.querySelector('#submit-btn');
        if (subGive && !state.submitted) { subGive.disabled = false; }
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
