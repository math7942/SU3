# 수수의 수학 (SU3)

브라우저에서 바로 실행되는 수업·업무용 HTML 도구 모음입니다. 서버가 필요 없고,
GitHub Pages로 그대로 공개할 수 있습니다.

공개 주소: `https://math7942.github.io/SU3/`

## 폴더 구조

```
index.html              허브 (7개 분류)
assets/site.css         모든 페이지가 함께 쓰는 스타일
01-play/                1. 수학과 놀자
02-lab/                 2. 수학실험 (아래 11개 실험실)
  01-common/              공통수학
  02-algebra/             대수
  03-statistics/          확률과 통계
  04-geometry/            기하
  05-calculus/            미적분
  06-ai-math/             인공지능 수학
  07-economics/           경제수학
  08-middle1/             중학교 1학년
  09-middle2/             중학교 2학년
  10-middle3/             중학교 3학년
  11-experience/          수학체험
03-work/                3. 업무 도구
04-festival/            4. 수학교사 1년 살이
05-susu/                5. 수수
06-group/               6. AI&에듀테크 사용 설명서
07-problems/            7. 수학문제 (2022 개정 교육과정 15개 과목)
  assets/                 문제 생성·채점 엔진과 전용 스타일
  01-common-math-1/       공통수학1
  02-common-math-2/       공통수학2
  03-basic-math-1/        기본수학1
  04-basic-math-2/        기본수학2
  05-algebra/             대수
  06-calculus-1/          미적분Ⅰ
  07-statistics/          확률과 통계
  08-geometry/            기하
  09-calculus-2/          미적분Ⅱ
  10-economics/           경제 수학
  11-ai-math/             인공지능 수학
  12-vocational/          직무 수학
  13-culture/             수학과 문화
  14-practical-statistics/ 실용 통계
  15-inquiry/             수학과제 탐구
```

폴더마다 있는 `index.html`이 그 분류의 목록 페이지이고, 도구 파일은 같은 폴더에 둡니다.

## 현재 도구

| 위치 | 파일 | 내용 |
|---|---|---|
| 수학과 놀자 | `01-play/teachable-machine.html` | 티처블 머신 소리 실험 |
| 수학과 놀자 | `01-play/river-crossing-game.html` | 강 건너기 게임 |
| 수학과 놀자 | `01-play/pig-dice-lab.html` | 피그 주사위 실험실 |
| 수학실험 › 대수 | `02-lab/02-algebra/sound-anc.html` | 삼각함수와 소음 제거 |
| 수학실험 › 인공지능 수학 | `02-lab/06-ai-math/rgb-matrix.html` | 픽셀 에디터와 RGB 행렬 |
| 수학실험 › 인공지능 수학 | `02-lab/06-ai-math/image-blender.html` | 이미지 블렌더 |
| 수학실험 › 인공지능 수학 | `02-lab/06-ai-math/handwriting.html` | 손글씨 숫자 인식 |
| 업무 도구 | `03-work/score-reports.html` | 학생별 정오표 출력 |
| 업무 도구 | `03-work/random-order.html` | 랜덤 순서 뽑기 |
| 업무 도구 | `03-work/image-resize.html` | 이미지 크기 변환 |
| 업무 도구 | `03-work/photo-format.html` | 원서용 사진 규격 변환 |
| 업무 도구 | `03-work/exam-range.html` | 3학년 시험범위 수합 |

수학교사 1년 살이는 `04-festival/`에 8단계 가이드·도구로 전체 공개됐습니다. 수수는 아직 비어 있습니다.

## 수학문제 (`07-problems/`)

2022 개정 교육과정의 수학 과목 15개를 과목별 연습 페이지로 만들어 둔 분류입니다.
과목을 고르면 영역과 주제가 나오고, 주제를 누르면 **문제가 그 자리에서 새로 만들어집니다.**
같은 주제를 다시 눌러도 숫자가 매번 달라지므로 반복 연습에 쓸 수 있습니다.

| 구분 | 과목 | 주제 수 |
|---|---|---|
| 공통 과목 | 공통수학1, 공통수학2, 기본수학1, 기본수학2 | 9, 11, 6, 5 |
| 일반 선택 | 대수, 미적분Ⅰ, 확률과 통계 | 10, 8, 9 |
| 진로 선택 | 기하, 미적분Ⅱ, 경제 수학, 인공지능 수학, 직무 수학 | 7, 7, 6, 6, 5 |
| 융합 선택 | 수학과 문화, 실용 통계, 수학과제 탐구 | 5, 6, 5 |

전체 105개 주제이고, 주제마다 개념 정리 → 문제 → 채점 → 해설의 순서로 이어집니다.
푼 문제 수와 정답 수는 그 기기의 브라우저(localStorage)에만 저장되며 서버로 보내지 않습니다.

### 구성

- `07-problems/assets/problems.js` — 문제를 만들고 채점하는 공통 엔진. 화면도 이 파일이 그립니다.
- `07-problems/assets/problems.css` — 수학문제 분류 전용 스타일 (`assets/site.css` 위에 얹어 씁니다).
- `07-problems/<과목폴더>/index.html` — 과목 페이지. 내용은 거의 같고 제목·아이콘만 다릅니다.
- `07-problems/<과목폴더>/data.js` — **그 과목의 영역·주제·문제**가 모두 들어 있는 파일.

### 주제를 추가하려면

해당 과목의 `data.js`를 열고, `areas` 안의 알맞은 영역에 아래 덩어리를 붙여 넣습니다.

```js
{
  id: 'my-topic',                 // 같은 과목 안에서 겹치지 않는 이름 (기록 저장에 씁니다)
  name: '주제 이름',
  desc: '카드에 보일 한 줄 설명',
  concept: '<p>개념 정리 한두 문단. 수식은 $x^2$ 처럼 씁니다.</p>',
  gen: function () {
    var a = M.i(1, 9);            // M.i(a, b): a 이상 b 이하의 정수
    return {
      q: '$' + a + ' \\times 7$ 의 값을 구하시오.',
      type: 'num',                // 'num'(숫자) · 'text'(문자열) · 'choice'(보기)
      ans: a * 7,
      sol: '<p>$' + a + ' \\times 7 = ' + (a * 7) + '$</p>'
    };
  }
}
```

`type: 'choice'` 이면 `choices: ['보기1', '보기2', ...]` 와 정답 번호(0부터) `ans` 를 함께 적습니다.
`type: 'text'` 이면 `alt: ['허용할 다른 답']` 을 줄 수 있고, 공백·대소문자는 무시하고 비교합니다.
답이 분수이면 `ans` 에는 수(예: `3/4` 는 `0.75`)를, `ansText` 에는 보여 줄 문자열을 적습니다.

문제를 만들 때 쓰는 도우미는 `M`(= `window.SU3M`)에 있습니다.
`M.i(a,b)` 정수, `M.nz(a,b)` 0이 아닌 정수, `M.pick(arr)` 하나 고르기, `M.shuffle(arr)` 섞기,
`M.two(a,b)` 서로 다른 두 정수, `M.frac/fracTex/fracStr` 분수, `M.poly([[계수,'문자'], ...])` 다항식,
`M.nCr/nPr/fact` 경우의 수, `M.num(x, 자릿수)` 반올림.

주제를 더하거나 뺀 뒤에는 과목 카드의 "주제 N개" 표시를 `07-problems/index.html`에서 고쳐 주세요.

### 과목을 추가하려면

1. `07-problems/`에 폴더를 만들고 기존 과목의 `index.html`을 복사해 제목·아이콘·설명만 고칩니다.
2. 같은 폴더에 `data.js`를 만들어 `window.SU3_SUBJECT = { id, name, areas: [...] }` 를 채웁니다.
3. `07-problems/index.html`의 알맞은 구분(공통/일반 선택/진로 선택/융합 선택)에 카드를 추가합니다.

## 시험범위 수합 도구 설정 (`03-work/exam-range.html`)

이 도구만은 다른 도구와 달리 브라우저 안에서 끝나지 않고, 구글 시트를 저장소로 씁니다.
선생님마다 로그인 없이 링크만 열어 입력할 수 있게 하기 위해서입니다. 아래 순서로 한 번만
연결하면 됩니다.

1. 데이터를 담을 구글 시트가 이미 만들어져 있습니다: `2026-2학기 1차 정기시험 3학년 시험범위 수합`
   (열: `날짜, 교시, 시간, 과목, 담당교사, 시험범위, 최종수정`, 3학년 22과목이 미리 채워져 있음)
2. 한 과목을 여러 선생님이 나눠 맡는 경우를 지원하려면 시트에 열을 하나 더 추가해야 합니다.
   시트에서 H1 칸을 클릭해 `id`라고 입력하세요 (담당교사별 제출 항목을 구분하는 값으로,
   Apps Script가 자동으로 채웁니다. 직접 값을 넣지 않아도 됩니다).
3. 그 시트를 열고 **확장 프로그램 → Apps Script**로 들어가 기존 코드를 전부 지우고 아래 코드를
   붙여넣습니다. (한 과목에 담당교사가 이미 있는 행이 있으면 새 담당교사는 새 행을 추가하고,
   `id`가 있는 요청은 그 행만 찾아 수정합니다. 맨 위 `ADMIN_PASSWORD`는 평가계님만 아는 값으로
   반드시 바꿔주세요 — 이 비밀번호로 표를 잠그고 여는 것을 통제합니다.)

   ```js
   var ADMIN_PASSWORD = "여기에_비밀번호를_정하세요"; // 반드시 바꾸세요

   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var data = sheet.getDataRange().getValues();
     var headers = data[0];
     var col = {
       subject: headers.indexOf("과목"),
       teacher: headers.indexOf("담당교사"),
       range_text: headers.indexOf("시험범위"),
       updated_at: headers.indexOf("최종수정"),
       id: headers.indexOf("id")
     };
     var rows = data.slice(1).map(function (row) {
       return {
         id: row[col.id],
         subject: row[col.subject],
         teacher: row[col.teacher],
         range_text: row[col.range_text],
         updated_at: row[col.updated_at]
       };
     });
     var locked = PropertiesService.getScriptProperties().getProperty("locked") === "true";
     return ContentService.createTextOutput(JSON.stringify({ rows: rows, locked: locked }))
       .setMimeType(ContentService.MimeType.JSON);
   }

   function doPost(e) {
     var payload = JSON.parse(e.postData.contents);

     // 잠금/해제는 비밀번호가 맞으면 잠긴 상태에서도 항상 처리한다(그래야 다시 열 수 있음)
     if (payload.action === "setLock") {
       if (payload.password !== ADMIN_PASSWORD) {
         return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "비밀번호가 올바르지 않습니다" }))
           .setMimeType(ContentService.MimeType.JSON);
       }
       PropertiesService.getScriptProperties().setProperty("locked", payload.locked ? "true" : "false");
       return ContentService.createTextOutput(JSON.stringify({ ok: true, locked: !!payload.locked }))
         .setMimeType(ContentService.MimeType.JSON);
     }

     // 잠겨 있으면 그 외의 모든 쓰기(입력/수정/삭제)를 거부한다
     var isLocked = PropertiesService.getScriptProperties().getProperty("locked") === "true";
     if (isLocked) {
       return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "제출이 마감되었습니다" }))
         .setMimeType(ContentService.MimeType.JSON);
     }

     var subject = payload.subject;
     var teacher = payload.teacher || "";
     var rangeText = payload.rangeText || "";
     var id = payload.id || "";

     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var data = sheet.getDataRange().getValues();
     var headers = data[0];
     var col = {
       date: headers.indexOf("날짜"),
       period: headers.indexOf("교시"),
       time: headers.indexOf("시간"),
       subject: headers.indexOf("과목"),
       teacher: headers.indexOf("담당교사"),
       range_text: headers.indexOf("시험범위"),
       updated_at: headers.indexOf("최종수정"),
       id: headers.indexOf("id")
     };
     var now = new Date();

     // 0) 삭제 요청이면 그 행의 담당교사/시험범위/id만 비워서 다시 빈 자리로 되돌림
     if (payload.action === "delete") {
       for (var rDel = 1; rDel < data.length; rDel++) {
         if (String(data[rDel][col.id]) === String(id)) {
           sheet.getRange(rDel + 1, col.teacher + 1).setValue("");
           sheet.getRange(rDel + 1, col.range_text + 1).setValue("");
           sheet.getRange(rDel + 1, col.updated_at + 1).setValue("");
           sheet.getRange(rDel + 1, col.id + 1).setValue("");
           return ContentService.createTextOutput(JSON.stringify({ ok: true }))
             .setMimeType(ContentService.MimeType.JSON);
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "id not found" }))
         .setMimeType(ContentService.MimeType.JSON);
     }

     // 1) id로 지정된 기존 항목이면 그 행만 찾아 수정
     if (id) {
       for (var r = 1; r < data.length; r++) {
         if (String(data[r][col.id]) === String(id)) {
           sheet.getRange(r + 1, col.teacher + 1).setValue(teacher);
           sheet.getRange(r + 1, col.range_text + 1).setValue(rangeText);
           sheet.getRange(r + 1, col.updated_at + 1).setValue(now);
           return ContentService.createTextOutput(JSON.stringify({ ok: true, id: id }))
             .setMimeType(ContentService.MimeType.JSON);
         }
       }
     }

     // 2) 그 과목의 미리 만들어둔 빈 자리(담당교사 없음)가 있으면 그 자리를 채움
     for (var r2 = 1; r2 < data.length; r2++) {
       if (data[r2][col.subject] === subject && !data[r2][col.teacher]) {
         var newId = Utilities.getUuid();
         sheet.getRange(r2 + 1, col.teacher + 1).setValue(teacher);
         sheet.getRange(r2 + 1, col.range_text + 1).setValue(rangeText);
         sheet.getRange(r2 + 1, col.updated_at + 1).setValue(now);
         sheet.getRange(r2 + 1, col.id + 1).setValue(newId);
         return ContentService.createTextOutput(JSON.stringify({ ok: true, id: newId }))
           .setMimeType(ContentService.MimeType.JSON);
       }
     }

     // 3) 빈 자리가 없으면(두 번째 이상 담당교사) 새 행을 추가
     var newId2 = Utilities.getUuid();
     sheet.appendRow([
       payload.date || "", payload.period || "", payload.time || "",
       subject, teacher, rangeText, now, newId2
     ]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true, id: newId2 }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

4. 오른쪽 위 **배포 → 새 배포**를 누르고, 유형은 **웹앱**을 선택합니다.
   - 실행 계정: **나**
   - 액세스 권한이 있는 사용자: **모든 사용자**
5. 배포하면 나오는 웹앱 URL(`https://script.google.com/macros/s/.../exec`)을 복사합니다.
6. `03-work/exam-range.html` 파일 맨 아래 `<script>`의 `CONFIG.APPS_SCRIPT_URL` 값에
   그 URL을 붙여넣고 저장합니다.

이미 배포해 두었다면: **배포 → 배포 관리 → 연필(수정) 아이콘 → 버전: 새 버전 → 배포**로
코드만 새로 반영하면 됩니다 (URL은 그대로 유지).

페이지의 **🔒 잠금/열기 (평가계용)** 버튼을 누르면 위에서 정한 `ADMIN_PASSWORD`를 물어봅니다.
잠그면 학생·선생님 화면에서는 표를 계속 볼 수 있지만, 입력·수정·삭제는 (버튼이 아예 안 보이고)
서버(Apps Script)에서도 거부됩니다. 비밀번호는 선생님들께 알리지 말고 평가계님만 아셔야 합니다.

이후 시트 내용을 바꾸려면(과목 추가·삭제, 오타 수정) 시트를 직접 편집해도 되고, 코드를 수정한 뒤
**배포 → 배포 관리 → 수정 → 새 버전**으로 다시 배포하면 됩니다(웹앱 URL은 그대로 유지됩니다).

시트를 좀 더 보기 좋게 꾸미고 싶다면: 1행을 선택해 굵게 하고 **보기 → 고정 → 1행**으로 머리글을
고정하면 스크롤해도 열 제목이 계속 보입니다.

## 도구를 추가하려면

1. HTML 파일을 해당 폴더에 넣습니다. 파일 이름에는 공백 대신 `-`를 씁니다.
2. 그 폴더의 `index.html`을 열어 `<div class="tools">` 안에 아래 덩어리를 붙여 넣습니다.
   도구가 아직 없던 폴더라면 `<div class="blank">...</div>` 전체를
   `<div class="tools"> ... </div>`로 바꾸면 됩니다.

```html
<a class="tool" href="파일이름.html">
  <span class="mark" aria-hidden="true">1</span>
  <span class="body">
    <h3>도구 이름</h3>
    <p>한 줄 설명.</p>
  </span>
  <span class="go">열기</span>
</a>
```

3. 한 단계 위 페이지의 "도구 N개 / 준비 중" 표시를 고칩니다.
   실험실이라면 `02-lab/index.html`의 해당 `subcard`에서, 최상위 분류라면
   루트 `index.html`의 해당 카드에서 고칩니다.

## 이름과 색을 바꾸려면

- 분류 이름: 해당 폴더 `index.html`의 `<h1>`과, 한 단계 위 페이지의 카드 문구.
- 강조색: 루트 카드와 각 페이지 `<body>`에 붙은 `g1`~`g6` 클래스가 정합니다.
  색 값은 `assets/site.css` 맨 위 "그룹별 강조색"에서 바꿉니다.
  수학실험의 하위 실험실은 모두 수학실험 색(`g2`)을 따릅니다.
