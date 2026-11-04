# broco Nihongo 운영 콘솔

학습 앱(`https://brocokr.github.io/nihongo/`)을 운영하는 관리자 페이지예요. 성과지표, 학습자 기록 관리, 선배 Q&A 답변, 공지·배너 관리를 해요.

## 올리는 법

1. 이 저장소에 `index.html`과 `firebase-config.js`를 맨 위에 올리고, **Settings → Pages**에서 `main` / `(root)`로 배포해요.
2. `firebase-config.js`에는 **학습 앱 저장소와 똑같은** Firebase 설정을 적고, `BROCCOLI_ADMINS`에 운영진 Google 이메일(소문자)을 적어요.
3. Firestore 보안 규칙의 `isAdmin()` 목록에도 같은 이메일을 적어요. (규칙 전문은 학습 앱 저장소 README에 있어요.)
4. 주소로 들어가 관리자 Google 계정으로 로그인해요. 등록되지 않은 계정은 들어올 수 없어요.

`firebase-config.js`가 비어 있으면 더미 학습자 24명과 질문 14개로 미리 보기가 열려요. 위쪽 ‘학습 앱 열기’를 누르면 학습 앱으로 가요.
