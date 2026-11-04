# broco Nihongo · GitHub Pages 배포 안내

| 파일 | 역할 |
|---|---|
| `index.html` | 학습 앱. 로그인하면 기록이 계정에 저장되고, 선배 Q&A가 실제 운영진에게 전달돼요. |
| `admin.html` | 운영 콘솔. 성과지표, 학습자 기록 관리, 선배 Q&A 답변, 공지·배너 관리. 위쪽 ‘학습 앱 열기’로 index.html로 바로 가요. |
| `firebase-config.js` | 두 페이지가 함께 읽는 Firebase 설정과 관리자 이메일 목록. **이 파일만 고치면 돼요.** |

세 파일을 같은 저장소 같은 폴더에 올려요. `firebase-config.js`가 비어 있으면 학습 앱은 로그인 없이(이 브라우저에만 저장) 돌아가고, 운영 콘솔은 더미 데이터로 열려요.

## 1. Firebase 준비 (무료 Spark 요금제로 충분해요)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 추가** (Google 애널리틱스는 꺼도 돼요).
2. 프로젝트 개요에서 **웹 앱 추가(`</>`)** → 닉네임 입력 → 나오는 `firebaseConfig` 값을 복사해요.
3. **Authentication → 시작하기 → 로그인 방법**에서 **Google**과 **이메일/비밀번호**를 사용 설정해요.
4. **Authentication → 설정 → 승인된 도메인**에 `내아이디.github.io`를 추가해요.
5. **Firestore Database → 데이터베이스 만들기** → 위치 `asia-northeast3 (서울)` → 프로덕션 모드로 만들고, **규칙** 탭에 아래 규칙을 붙여 넣은 뒤 **게시**해요. `관리자@gmail.com`은 운영진 Google 계정 이메일(소문자)로 바꿔요. 여러 명이면 쉼표로 이어 써요.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin() {
      return signedIn() && request.auth.token.email_verified == true
        && request.auth.token.email in ['관리자@gmail.com'];
    }

    // 학습 기록: 본인만, 관리자는 전체
    match /users/{uid} {
      allow read, write: if signedIn() && request.auth.uid == uid;
      allow read, write: if isAdmin();
    }

    // 선배 Q&A: 학습자는 자기 질문만 만들고 읽고, 평가·취소·재배정 요청만 바꿀 수 있어요
    match /questions/{qid} {
      allow read: if isAdmin() || (signedIn() && resource.data.uid == request.auth.uid);
      allow create: if signedIn() && request.resource.data.uid == request.auth.uid
        && request.resource.data.status == 'wait'
        && request.resource.data.text is string && request.resource.data.text.size() <= 400;
      allow update: if isAdmin() || (signedIn() && resource.data.uid == request.auth.uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['rating', 'status', 'reassignReq'])
        && request.resource.data.status in [resource.data.status, 'cancel']);
      allow delete: if isAdmin();
    }

    // 공지·배너: 누구나 읽고, 관리자만 바꿔요
    match /config/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## 2. firebase-config.js 채우기

2번에서 복사한 값을 `BROCCOLI_FIREBASE`에, 운영진 이메일을 `BROCCOLI_ADMINS`에 적어요. 이메일은 1-5의 보안 규칙과 똑같이 적어야 해요. 이 값들은 공개 저장소에 올라가도 괜찮아요. 기록을 지키는 건 보안 규칙이에요.

```js
window.BROCCOLI_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "내프로젝트.firebaseapp.com",
  projectId: "내프로젝트",
  storageBucket: "내프로젝트.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123"
};
window.BROCCOLI_ADMINS = ["관리자@gmail.com"];
```

## 3. GitHub Pages에 올리기

1. GitHub에서 **새 저장소**를 만들어요 (예: `broccoli-nihongo`, Public).
2. **Add file → Upload files**로 세 파일을 한꺼번에 올리고 Commit.
3. **Settings → Pages**에서 Source를 `Deploy from a branch`, 브랜치를 `main` / `(root)`로 고르고 Save.
4. 1~2분 뒤 접속해요.
   - 학습 앱: `https://내아이디.github.io/broccoli-nihongo/`
   - 운영 콘솔: `https://내아이디.github.io/broccoli-nihongo/admin.html` (관리자 Google 계정으로 로그인)

## 운영 콘솔에서 할 수 있는 일

| 탭 | 내용 |
|---|---|
| 대시보드 | 성과지표 5개(정의·계산식·목표 포함), 최근 14일 학습자 수, 단계별 분포, Q&A 현황, 먼저 챙길 학습자(3일 이상 쉼 / 정답률 55% 미만) |
| 학습자 | 검색·단계 필터·정렬, 학습자별 상세 기록(14일 활동, 배치 결과, 오답 노트, 질문), 레벨 조정, 기록 초기화, CSV 내보내기 |
| 선배 Q&A | 처리할 질문(지연 우선), 담당 선배 배정·재배정, 답변 작성, 사유를 고른 취소, 학습자의 재배정 요청·평가 확인, 튜터별 맡은 질문 수 |
| 공지·배너 | 학습 앱 홈 화면의 질문 배너 문구·버튼, 공지 한 줄과 종료일, 휴대폰 미리보기 |

### 성과지표 정의

| 지표 | 계산식 | 목표 | 고른 이유 |
|---|---|---|---|
| 주간 활성 학습자 | 최근 7일에 카드·퀴즈·쓰기를 1개 이상 한 학습자 ÷ 전체 학습자 | 60% | 매일 조금씩 하는 습관형 학습 서비스의 핵심 |
| 7일 재방문율 | 첫 학습일이 7일 넘게 지난 학습자 중 첫날 다음 7일 안에 다시 공부한 비율 | 40% | 첫 경험(배치 경기·첫 레슨)이 다시 오게 만드는지 확인 |
| 퀴즈 정답률 | 최근 7일 맞힌 퀴즈 ÷ 푼 퀴즈 | 70~85% | 레벨 난이도가 알맞은지 확인 (낮으면 어렵고 높으면 쉬움) |
| 하루 목표 달성률 | 최근 7일 공부한 날 중 하루 목표(기본 20개)를 채운 날 ÷ 공부한 날 | 50% | 학습량 목표가 현실적인지 확인 |
| 2시간 내 답변율 | 최근 30일 답변 완료 질문 중 접수~답변 2시간 이내 ÷ 답변 완료 질문 | 90% | 사람이 답하는 Q&A 서비스의 약속(대기 시간) 관리 |

## 저장 방식

| 항목 | 내용 |
|---|---|
| 학습 기록 | Firestore `users/{UID}` 문서 하나. 공부하면 2.5초 뒤 자동 저장, 앱을 닫을 때도 저장 |
| 처음 로그인 | 계정이 비어 있으면 이 기기 기록을 올려요. 양쪽에 기록이 있으면 어느 쪽을 쓸지 물어봐요 |
| 다른 기기 | 열 때마다 계정의 최신 기록을 확인해서 더 새로우면 불러와요 |
| 선배 질문 | 로그인한 학습자의 질문은 `questions` 컬렉션으로 가고, 운영 콘솔의 답변이 학습자 질문함에 실시간으로 떠요. 로그인하지 않으면 지금처럼 데모 자동 답변으로 동작해요 |
| 공지·배너 | `config/app` 문서. 학습 앱을 열 때 읽어요 |
| 관리자가 바꾼 레벨·초기화 | 학습자가 앱을 다시 열면 반영되고, "운영진이 학습 기록을 조정했어요" 안내가 떠요 |

## 알려진 한계

- 두 기기에서 동시에 공부하면 나중에 저장한 쪽 기록이 남아요.
- 관리자가 레벨을 바꿀 때 학습자가 앱을 쓰는 중이면, 그 기기에서 나중에 저장되는 학습량이 섞일 수 있어요. 레벨은 관리자 값이 유지돼요.
- 계정 문서는 1MB까지 저장돼요.
- 운영 콘솔의 학습자 목록은 열 때와 ‘새로고침’을 누를 때 불러와요. 질문은 실시간으로 들어와요.
- 카카오톡·인스타그램 앱 안의 브라우저에서는 Google 로그인이 막혀요. 학습 앱은 이메일 로그인을 쓸 수 있고, 운영 콘솔은 일반 브라우저에서 열어 주세요.
- Spotify 연동과 AI 예문은 claude.ai 안에서만 동작해요.
- 선배 튜터 3명(하윤·민재·사토)은 시연용 이름이에요. 실제 운영진 이름으로 바꾸려면 `index.html`과 `admin.html`의 `TUTORS`를 함께 고쳐요.
- 무료 요금제 한도: 하루 읽기 5만·쓰기 2만 회. 고객 테스트 규모(수십 명)에서는 넉넉해요.

## 테스트 기록

실제 Firebase 대신 같은 함수 이름을 가진 **모의 Firebase**를 붙여 브라우저(Chromium)에서 자동으로 확인했어요. 실제 Firebase를 연결한 뒤에는 T1, T3, A3, A5, A7을 직접 한 번 더 해 보세요.

### 로그인·저장

| ID | 시나리오 | 기대 결과 | 결과 |
|---|---|---|---|
| T0 | 설정 없는 버전: 로그인 없이 동작 | 환영 화면, 오버레이 없음, 로그인 버튼 → '아직 연결되지 않은' 안내 | 통과 |
| T1 | 게스트 기록 → Google 로그인 → 계정에 업로드 | 새 계정에 xp 3000이 저장되고 버튼이 '내 계정' | 통과 |
| T2 | 공부하면 자동 저장 | 2.5초 뒤 계정 xp = 기기 xp | 통과 |
| T3 | 새 기기에서 같은 계정 → 기록 불러오기 | 다른 기기(B)에서 열면 계정 기록으로 이어짐 | 통과 |
| T4 | 두 기기 동기화 | A에서 더 공부한 뒤 B를 새로 열면 A의 최신 기록 | 통과 |
| T5 | 저장 실패(권한 오류) | 빨간 점 + 오류 안내, 학습은 계속 가능 | 통과 |
| T5b | 연결 회복 후 지금 저장 | 오류가 사라지고 '계정에 저장했어요' | 통과 |
| T6 | 로그아웃 | 기기 기록은 지워지고 처음 화면, 계정 기록은 그대로 | 통과 |
| T7 | 환영 화면에서 다시 로그인 | 계정 기록을 불러와 홈 화면으로 복귀 | 통과 |
| T8 | 이메일 입력 오류 처리 | 형식·짧은 비번·중복 가입·틀린 비번마다 안내 | 통과 |
| T9 | 이메일 회원가입 | 가입 즉시 로그인, 현재 기록(xp 40) 저장 | 통과 |
| T10 | 게스트 기록과 계정 기록이 다를 때 | 두 기록 중 고르는 화면 → '계정 기록' 선택 시 계정 레벨로 | 통과 |
| T11 | 팝업 차단 시 | 리디렉션 로그인으로 전환 | 통과 |

### 운영 콘솔 ↔ 학습 앱

| ID | 시나리오 | 기대 결과 | 결과 |
|---|---|---|---|
| A1 | 학습자 질문 → 서버 접수 | 로그인한 학습자의 질문이 questions 컬렉션에 status=wait로 저장 | 통과 |
| A2 | 관리자 아닌 계정 차단 | 등록되지 않은 계정은 '관리자로 등록되지 않았어요' 화면만 보임 | 통과 |
| A3 | 관리자 로그인 → 실데이터 | Google 로그인 후 학습자 1명, 처리할 질문 1개가 보임 | 통과 |
| A4 | 관리자 배정 → 학습자 화면 반영 | 배정하면 학습자 질문함에 '답변 작성 중 · 민재 선배'가 실시간으로 표시 | 통과 |
| A5 | 답변 보내기 → 학습자 알림 | 답변이 저장되고 학습자 화면에 도착 알림과 '새 답변 1개' 표시 | 통과 |
| A6 | 학습자 평가 → 관리자 화면 | 학습자가 '도움 됐어요'를 누르면 관리자 카드에 평가가 보임 | 통과 |
| A7 | 공지·배너 수정 → 학습 앱 반영 | 저장 후 학습 앱을 새로 열면 공지와 바뀐 배너 제목이 보임 | 통과 |
| A8 | 관리자 레벨 조정 → 학습자 반영 | 학습자 Lv을 100으로 바꾸면 앱을 다시 열 때 Lv.100 + 안내 | 통과 |
| A9 | 실데이터 성과지표 | 질문 1개 답변 완료 → 2시간 내 답변율 100% | 통과 |
| A10 | 보안 규칙에 관리자 누락 | users 읽기가 막히면 원인(보안 규칙의 관리자 목록)을 안내 | 통과 |
