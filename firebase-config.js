// ─────────────────────────────────────────────────────────────
// Firebase 설정 — 이 파일만 우리 학교(또는 배포자) 것으로 바꾸면 됩니다.
// Firebase 콘솔 → 프로젝트 설정(톱니) → 일반 → 내 앱 → "SDK 설정 및 구성" → 구성(Config) 에 나오는
// firebaseConfig 값을 그대로 복사해 아래에 붙여 넣으세요. (따옴표 안의 값만 바꾸면 됩니다)
// 이 값들은 비밀번호가 아니라 "주소"라서 공개되어도 됩니다. 접근 제한은 Firestore 규칙이 담당합니다.
// ─────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBiBfgTuW8f9fYtM_47zZTXomhFXuSpEq8",
  authDomain: "schoolbudget-14586.firebaseapp.com",
  projectId: "schoolbudget-14586",
  storageBucket: "schoolbudget-14586.firebasestorage.app",
  messagingSenderId: "990166159401",
  appId: "1:990166159401:web:0056f67810d2a5e5794c38"
};

// 연수용 표시 — 이 줄이 있으면 주소를 열자마자 연습용 학교(샘플 자료)가 열리고,
// 처음 설정 화면이나 실제 프로그램으로 가는 링크가 나오지 않습니다. 지우지 마세요.
const SITE_MODE = 'demo';
