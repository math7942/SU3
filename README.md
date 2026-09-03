# 수수의 수학 (SU3)

브라우저에서 바로 실행되는 수업·업무용 HTML 도구 모음입니다. 서버가 필요 없고,
GitHub Pages로 그대로 공개할 수 있습니다.

공개 주소: `https://math7942.github.io/SU3/`

## 폴더 구조

```
index.html              허브 (6개 분류)
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
04-festival/            4. 수학축제
05-susu/                5. 수수
06-group/               6. (미정)
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

수학축제, 수수, 6번 분류는 아직 비어 있습니다.

## 시험범위 수합 도구 설정 (`03-work/exam-range.html`)

이 도구만은 다른 도구와 달리 브라우저 안에서 끝나지 않고, 구글 시트를 저장소로 씁니다.
선생님마다 로그인 없이 링크만 열어 입력할 수 있게 하기 위해서입니다. 아래 순서로 한 번만
연결하면 됩니다.

1. 데이터를 담을 구글 시트가 이미 만들어져 있습니다: `2026-2학기 1차 정기시험 3학년 시험범위 수합`
   (열: `날짜, 교시, 시간, 과목, 담당교사, 시험범위, 최종수정`, 3학년 22과목이 미리 채워져 있음)
2. 그 시트를 열고 **확장 프로그램 → Apps Script**로 들어가 기본 코드를 지우고 아래 코드를 붙여넣습니다.
   (시트의 열 제목은 한글 그대로 두고, 코드에서 한글 열 이름을 찾아 페이지가 쓰는 영문 키로
   바꿔 보내 줍니다.)

   ```js
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var data = sheet.getDataRange().getValues();
     var headers = data[0];
     var col = {
       subject: headers.indexOf("과목"),
       teacher: headers.indexOf("담당교사"),
       range_text: headers.indexOf("시험범위"),
       updated_at: headers.indexOf("최종수정")
     };
     var rows = data.slice(1).map(function (row) {
       return {
         subject: row[col.subject],
         teacher: row[col.teacher],
         range_text: row[col.range_text],
         updated_at: row[col.updated_at]
       };
     });
     return ContentService.createTextOutput(JSON.stringify({ rows: rows }))
       .setMimeType(ContentService.MimeType.JSON);
   }

   function doPost(e) {
     var payload = JSON.parse(e.postData.contents);
     var subject = payload.subject;
     var teacher = payload.teacher || "";
     var rangeText = payload.rangeText || "";

     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
     var data = sheet.getDataRange().getValues();
     var headers = data[0];
     var subjectCol = headers.indexOf("과목");
     var teacherCol = headers.indexOf("담당교사");
     var rangeCol = headers.indexOf("시험범위");
     var updatedCol = headers.indexOf("최종수정");

     for (var r = 1; r < data.length; r++) {
       if (data[r][subjectCol] === subject) {
         sheet.getRange(r + 1, teacherCol + 1).setValue(teacher);
         sheet.getRange(r + 1, rangeCol + 1).setValue(rangeText);
         sheet.getRange(r + 1, updatedCol + 1).setValue(new Date());
         return ContentService.createTextOutput(JSON.stringify({ ok: true }))
           .setMimeType(ContentService.MimeType.JSON);
       }
     }
     return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "subject not found" }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. 오른쪽 위 **배포 → 새 배포**를 누르고, 유형은 **웹앱**을 선택합니다.
   - 실행 계정: **나**
   - 액세스 권한이 있는 사용자: **모든 사용자**
4. 배포하면 나오는 웹앱 URL(`https://script.google.com/macros/s/.../exec`)을 복사합니다.
5. `03-work/exam-range.html` 파일 맨 아래 `<script>`의 `CONFIG.APPS_SCRIPT_URL` 값에
   그 URL을 붙여넣고 저장합니다.

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
