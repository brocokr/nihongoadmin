// broco Nihongo · Firebase 설정
// index.html(학습 앱)과 admin.html(운영 콘솔)이 이 파일 하나를 함께 읽어요.
// Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹)의 firebaseConfig 값을 아래에 붙여 넣으세요.
// 이 값들은 공개 저장소에 올라가도 괜찮아요. 기록을 지키는 건 Firestore 보안 규칙이에요.
window.BROCCOLI_FIREBASE = {
  apiKey: "AIzaSyBUb6lvk8tcGvgJ5I0n3pk8ZADfJbQnLGk",
  authDomain: "broconihongo.firebaseapp.com",
  projectId: "broconihongo",
  storageBucket: "broconihongo.firebasestorage.app",
  messagingSenderId: "69012539171",
  appId: "1:69012539171:web:0c126d8ae38bd829c12e96"
};

// 운영 콘솔(admin.html)에 들어올 수 있는 Google 계정 이메일 (소문자로)
// Firestore 보안 규칙의 isAdmin() 목록에도 똑같이 적어 주세요.
window.BROCCOLI_ADMINS = [
  "10asakii@gmail.com"
];
