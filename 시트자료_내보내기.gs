/**
 * 구글 시트 버전 → 파이어베이스 버전으로 자료 옮기기
 * 사용법: 기존 Apps Script 프로젝트에 이 파일을 추가(파일 + → 스크립트)하고 저장한 뒤,
 *        함수 선택에서 exportForFirebase 를 고르고 실행 → 실행 로그(또는 알림창)의 드라이브 링크에서 JSON 파일을 내려받습니다.
 *        새 프로그램의 관리자 → 데이터 → 자료 가져오기에서 그 파일을 "전체"로 가져오면 됩니다.
 * 현재 학년도와 보관된 학년도(2026_예산 같은 시트)가 모두 들어갑니다.
 */
function exportForFirebase() {
  ensureSetup_();
  const s = readSettings_();
  const yearSettings = {};
  ['학급수_1', '학급수_2', '학급수_3', '학급수_4', '학급수_5', '학급수_6', '학년비밀번호사용', '학년비밀번호_1', '학년비밀번호_2', '학년비밀번호_3', '학년비밀번호_4', '학년비밀번호_5', '학년비밀번호_6', '학년비밀번호_전담']
    .forEach(k => { yearSettings[k] = (k.indexOf('학급수_') === 0) ? Number(s[k] || 0) : String(s[k] === undefined ? '' : s[k]); });
  const out = {
    format: 'yesan-v2', exportedAt: now_(), 학교코드: '',
    school: { 학교명: String(s.학교명 || ''), 학년도: String(s.학년도 || ''), 관리자비밀번호해시: String(s.관리자비밀번호해시 || ''), 솔트: String(s.솔트 || ''), 구매처목록: String(s.구매처목록 || '지마켓,아이스크림몰,학교장터,쿠팡') },
    부서: readAnySheet_('부서'), 담당자: readAnySheet_('담당자'), 문구: readAnySheet_('문구').filter(p => p.범위 === '관리자'), 변경이력: readAnySheet_('변경이력'),
    years: {},
  };
  out.years[String(s.학년도)] = buildYearExport_('', yearSettings);
  const ss = db_();
  ss.getSheets().forEach(sh => { const m = sh.getName().match(/^(\d{4})_예산$/); if (m && !out.years[m[1]]) out.years[m[1]] = buildYearExport_(m[1] + '_', yearSettings); });
  const name = `예산관리_내보내기_${String(s.학교명 || '학교')}_${now_().replace(/[: ]/g, '-')}.json`;
  const file = DriveApp.createFile(name, JSON.stringify(out), 'application/json');
  Logger.log('내보내기 파일: ' + file.getUrl());
  try { SpreadsheetApp.getUi().alert('내보내기 완료\n드라이브에 파일이 만들어졌습니다. 내려받아 새 프로그램의 "자료 가져오기(전체)"에 올리세요.\n\n' + file.getUrl()); } catch (e) {}
  return file.getUrl();
}

/** 시트 이름으로 읽되 헤더 글자로 열을 찾는다 (보관 시트처럼 열 구성이 조금 달라도 읽히도록) */
function readAnySheet_(sheetName) {
  const sh = db_().getSheetByName(sheetName);
  if (!sh) return [];
  const last = sh.getLastRow(); if (last < 2) return [];
  const header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
  const tz = Session.getScriptTimeZone();
  return sh.getRange(2, 1, last - 1, header.length).getValues().filter(r => r.some(c => c !== '')).map(r => {
    const o = {};
    header.forEach((h, i) => { if (!h) return; let v = r[i]; if (v instanceof Date) v = Utilities.formatDate(v, tz, 'yyyy-MM-dd HH:mm:ss'); o[h] = v; });
    return o;
  });
}

function buildYearExport_(prefix, yearSettings) {
  const read = n => readAnySheet_(prefix + n);
  const 배부 = read('배부'), 학급분배 = read('학급분배'), 제목 = read('제목'), 품의 = read('품의'), 품목 = read('품목');
  const 문구 = read('문구').filter(p => p.범위 && p.범위 !== '관리자');
  const allocs = 배부.filter(a => a.id).map(a => {
    const dist = {}; 학급분배.filter(d => d.배부id === a.id).forEach(d => { dist[String(Number(d.반) || 0)] = Number(String(d.금액).replace(/[^\d.-]/g, '')) || 0; });
    return Object.assign({}, a, {
      대상: String(a.대상), 학급분배: dist,
      제목목록: 제목.filter(t => t.배부id === a.id).sort((x, y) => Number(x.순서) - Number(y.순서)).map(t => String(t.제목템플릿)),
      문구목록: 문구.filter(p => p.범위 === a.id).sort((x, y) => Number(x.순서) - Number(y.순서)).map(p => ({ 이름: String(p.이름), 본문템플릿: String(p.본문템플릿) })),
      담당자품의: a.담당자품의 === 'Y' ? 'Y' : 'N',
    });
  });
  const allocBy = {}; allocs.forEach(a => allocBy[a.id] = a);
  const pumui = 품의.filter(p => p.id).map(p => {
    const items = 품목.filter(i => i.품의id === p.id).sort((x, y) => Number(x.순서) - Number(y.순서)).map(i => {
      const o = Object.assign({}, i); delete o.품의id; o.수량 = Number(String(o.수량).replace(/[^\d.-]/g, '')) || 0; o.예상단가 = Number(String(o.예상단가).replace(/[^\d.-]/g, '')) || 0; o.반 = Number(o.반) || 0; o.링크 = String(o.링크 || ''); return o;
    });
    const a = allocBy[p.배부id] || {};
    return Object.assign({}, p, {
      대상: String(a.대상 || ''), 반: Number(p.반) || 0, 차수: Number(p.차수) || 1,
      담기완료: String(p.담기완료 || '').split(',').map(x => Number(x)).filter(Boolean),
      조정합계: (p.조정합계 === '' || p.조정합계 === undefined || p.조정합계 === null) ? '' : Number(p.조정합계),
      학급담기: p.학급담기 === 'Y' ? 'Y' : 'N', 취합그룹: String(p.취합그룹 || ''), 품목: items,
    });
  });
  return { 설정: yearSettings, 예산: read('예산').filter(b => b.id), 배부: allocs, 품의: pumui, 매칭기억: read('매칭기억').filter(m => m.id), 업로드이력: read('업로드이력').filter(h => h.id) };
}
