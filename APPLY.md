# SU3 저장소 만들기

기존 `math_26` 저장소는 그대로 두고, 새 저장소 `SU3`를 만들어 이 폴더의 내용을
올립니다. 아무것도 지우지 않으므로 되돌릴 일이 없습니다.

## 1. 빈 저장소 만들기

1. github.com 오른쪽 위 `+` → `New repository`
2. Repository name 칸에 `SU3` 입력
3. Public 선택
4. "Add a README file" 체크는 **하지 않습니다** (이 폴더에 이미 있습니다)
5. `Create repository`

## 2. 파일 올리기

1. 만들어진 빈 저장소 화면 가운데의 `uploading an existing file` 링크를 누릅니다.
   (안 보이면 `Add file` → `Upload files`)
2. 압축을 푼 `SU3` 폴더 안으로 들어갑니다.
3. 폴더 자체가 아니라 **그 안의 내용물 전체**를 선택(Ctrl+A)해서 업로드 영역으로 끌어다 놓습니다.
   `index.html`, `README.md`, `assets`, `01-play`, `02-lab` … 이 모두 포함되어야 합니다.
4. 파일 목록이 다 뜨면 아래 칸에 `첫 업로드`라고 적고 초록색 `Commit changes`를 누릅니다.

파일이 50개라 1~2분 걸릴 수 있습니다.

## 3. 웹으로 공개하기

1. 저장소 위쪽 `Settings` → 왼쪽 메뉴 `Pages`
2. Source를 `Deploy from a branch`로 두고, Branch를 `main`, 폴더를 `/ (root)`로 선택 후 `Save`
3. 몇 분 뒤 `https://math7942.github.io/SU3/` 에 접속

## 4. 확인

아래 세 가지만 눌러 보면 전체가 정상인지 알 수 있습니다.

- 허브에 카드 6개가 보이는지
- 수학실험 → 인공지능 수학 → 손글씨 숫자 인식이 열리는지
- 각 페이지 왼쪽 위 되돌아가기 링크가 작동하는지

## 참고

`.nojekyll`은 GitHub가 파일을 손대지 않고 그대로 서비스하도록 하는 빈 파일입니다.
윈도우 탐색기에서 점으로 시작하는 파일이 숨겨져 보이지 않으면,
보기 메뉴에서 "숨긴 항목"을 켜고 함께 올리세요. 빠뜨려도 사이트는 정상 작동합니다.
