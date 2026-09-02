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

수학축제, 수수, 6번 분류는 아직 비어 있습니다.

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
