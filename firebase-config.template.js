// ─────────────────────────────────────────────────────────────
// Firebase 설정 — 이 파일만 우리 학교(또는 배포자) 것으로 바꾸면 됩니다.
// Firebase 콘솔 → 프로젝트 설정(톱니) → 일반 → 내 앱 → "SDK 설정 및 구성" → 구성(Config) 에 나오는
// firebaseConfig 값을 그대로 복사해 아래에 붙여 넣으세요. (따옴표 안의 값만 바꾸면 됩니다)
// 이 값들은 비밀번호가 아니라 "주소"라서 공개되어도 됩니다. 접근 제한은 Firestore 규칙이 담당합니다.
// ─────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "여기에-apiKey",
  authDomain: "프로젝트ID.firebaseapp.com",
  projectId: "프로젝트ID",
  storageBucket: "프로젝트ID.appspot.com",
  messagingSenderId: "숫자",
  appId: "1:숫자:web:영문숫자"
};
