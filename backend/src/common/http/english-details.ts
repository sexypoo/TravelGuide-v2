// English versions of API error details (#80, ADR-054). Services keep writing
// Korean; the problem filter swaps in English when the request carries the
// web app's `locale=en` cookie. english-details.spec.ts fails when a Korean
// message in src/ has no entry here.

export const ENGLISH_DETAILS: Readonly<Record<string, string>> = {
  // Accounts and sign-in
  'Apple 계정 연결을 해제하지 못했습니다. 잠시 후 다시 시도해 주세요.':
    "We couldn't disconnect your Apple account. Please try again shortly.",
  '현재 비밀번호를 확인해 주세요.': 'Please check your current password.',
  '관리자 계정은 이 화면에서 삭제할 수 없습니다.':
    "Admin accounts can't be deleted here.",
  '관리자 권한이 필요합니다.': 'Admin access is required.',
  '로그인이 필요합니다.': 'Please log in.',
  '이미 가입된 이메일입니다.': 'This email is already registered.',
  '이메일 또는 비밀번호가 올바르지 않습니다.':
    'The email or password is incorrect.',
  '유효하지 않은 로그인 세션입니다.':
    'Your session is no longer valid. Please log in again.',
  '이미 사용 중인 닉네임입니다.': 'This nickname is taken.',
  '재설정 메일을 보낼 수 없습니다. 잠시 후 다시 시도해 주세요.':
    "We can't send the reset email right now. Please try again shortly.",
  '재설정 링크가 만료되었거나 이미 사용되었습니다.':
    'This reset link has expired or was already used.',
  '연결된 계정이 없습니다. 먼저 계정을 만들어 주세요.':
    'No account is linked yet. Please create an account first.',
  '계정을 만들 수 없습니다. 잠시 후 다시 시도해 주세요.':
    "We couldn't create your account. Please try again shortly.",
  '현재 사용할 수 없는 로그인 방식입니다.':
    "This sign-in method isn't available right now.",
  '비밀번호에 영문자를 넣어 주세요.': 'Your password needs a letter.',
  '비밀번호에 숫자를 넣어 주세요.': 'Your password needs a number.',
  '확인 문구로 계정 삭제를 입력해 주세요.':
    'Type the confirmation phrase to delete your account.',
  '닉네임을 입력해 주세요.': 'Please enter a nickname.',
  '사용자를 찾을 수 없습니다.': "We couldn't find that user.",
  '사용자 차단은 현재 지원하지 않습니다.':
    "Blocking users isn't supported yet.",

  // Profile and files
  '프로필 사진을 찾을 수 없습니다.': "We couldn't find that profile photo.",
  '프로필 사진을 선택해 주세요.': 'Please choose a profile photo.',
  '이미지는 10MB 이하여야 합니다.': 'Images must be 10MB or smaller.',
  '증빙 파일은 5MB 이하여야 합니다.': 'Proof files must be 5MB or smaller.',
  '프로필 사진은 5MB 이하여야 합니다.':
    'Profile photos must be 5MB or smaller.',
  'JPEG, PNG, WebP 이미지만 보낼 수 있습니다.':
    'You can send JPEG, PNG, or WebP images only.',
  'JPEG, PNG, PDF 파일만 업로드할 수 있습니다.':
    'You can upload JPEG, PNG, or PDF files only.',
  'JPEG, PNG, WebP 이미지만 사용할 수 있습니다.':
    'You can use JPEG, PNG, or WebP images only.',

  // Verification
  '여행지를 찾을 수 없습니다.': "We couldn't find that destination.",
  'GPS 정확도가 낮습니다. 위치를 다시 확인해 주세요.':
    'Your GPS accuracy is low. Please check your location again.',
  '여행 시작일은 종료일보다 늦을 수 없습니다.':
    "The trip can't start after it ends.",
  '선택한 여행지의 인증 가능 지역 밖입니다.':
    "You're outside the verification area for this destination.",
  '증빙 파일을 첨부해 주세요.': 'Please attach a proof file.',
  '반려 사유를 10자 이상 입력해 주세요.':
    'Please give a rejection reason of at least 10 characters.',
  '여행 종료일은 신청 시각보다 이전일 수 없습니다.':
    "The trip's end date can't be in the past.",
  '이미 승인된 여행 기간에 포함된 신청입니다.':
    'This trip is already covered by an approved verification.',
  '같은 유형의 인증이 이미 심사 중입니다.':
    'A verification of the same type is already under review.',
  '이미 처리된 인증 신청입니다.': 'This verification was already reviewed.',
  '인증 신청을 찾을 수 없습니다.': "We couldn't find that verification.",

  // Rooms, chat, topics, answers
  '방을 찾을 수 없습니다.': "We couldn't find that room.",
  '유효한 여행자 또는 현지인 인증이 필요합니다.':
    'You need a valid traveler or local verification.',
  '현재 유효한 여행자 또는 현지인 인증이 필요합니다.':
    'You need a current traveler or local verification.',
  '메시지 목록 cursor가 올바르지 않습니다.':
    'The message list position is invalid.',
  '페이지 위치가 올바르지 않습니다.': 'The page position is invalid.',
  '질문 목록 cursor가 올바르지 않습니다.':
    'The topic list position is invalid.',
  '이미 토픽으로 만든 메시지입니다.':
    'This message was already turned into a topic.',
  '채팅 이미지를 찾을 수 없습니다.': "We couldn't find that chat image.",
  '보낼 이미지를 선택해 주세요.': 'Please choose an image to send.',
  '본인이 이 방에 작성한 메시지만 토픽으로 만들 수 있습니다.':
    'You can only turn your own messages in this room into topics.',
  '토픽으로 만들 메시지는 20자 이상이어야 합니다.':
    'A message needs at least 20 characters to become a topic.',
  '토픽 작성자만 해결 상태를 결정할 수 있습니다.':
    'Only the person who posted the topic can resolve it.',
  '한 방에서 동시에 진행할 수 있는 질문은 최대 3개입니다.':
    'You can have up to 3 open topics in a room at once.',
  '만료된 질문에는 답변할 수 없습니다.': "You can't answer an expired topic.",
  '만료된 토픽은 해결 상태를 변경할 수 없습니다.':
    "An expired topic can't be resolved.",
  '토픽 이미지를 찾을 수 없습니다.': "We couldn't find that topic image.",
  '질문을 찾을 수 없습니다.': "We couldn't find that topic.",
  '열린 질문에만 답변할 수 있습니다.': 'You can only answer open topics.',
  '진행 중인 토픽만 해결할 수 있습니다.': 'Only open topics can be resolved.',
  '토픽 본문 또는 원본 메시지가 필요합니다.':
    'A topic needs text or an original message.',
  '메시지를 토픽으로 잇는 경우에는 새 사진을 첨부할 수 없습니다.':
    "You can't add a new photo when turning a message into a topic.",
  '이 방에서 공유할 수 있는 토픽이 아닙니다.':
    "This topic can't be shared in this room.",
  '이 토픽 종류에는 현장 상태 항목을 추가할 수 없습니다.':
    "On-site status can't be added to this kind of topic.",
  '대기·혼잡 토픽에는 현재 대기 또는 현장 상태를 하나 이상 알려주세요.':
    'For wait and crowd topics, share at least one current wait or on-site status.',
  '답변 이미지를 찾을 수 없습니다.': "We couldn't find that answer image.",
  '한 질문에 작성할 수 있는 답변은 최대 3개입니다.':
    'You can post up to 3 answers on a topic.',
  '이 토픽에서 채택할 수 있는 답변이 아닙니다.':
    "This answer can't be accepted on this topic.",
  '자신이 작성한 질문에는 답변할 수 없습니다.':
    "You can't answer your own topic.",
  '현장 확인 시각은 미래일 수 없습니다.':
    "The on-site check time can't be in the future.",
  '출처 URL은 유효한 HTTPS 주소여야 합니다.':
    'The source URL must be a valid HTTPS address.',
  '공식 정보 출처에는 HTTPS URL이 필요합니다.':
    'Official sources need an HTTPS URL.',
  '채택할 답변을 선택해 주세요.': 'Please choose an answer to accept.',
  '답변 식별자가 너무 깁니다.': 'The answer ID is too long.',

  // Community, places, travel records
  '커뮤니티 게시글을 찾을 수 없습니다.': "We couldn't find that post.",
  '관리자 계정은 커뮤니티에 글이나 댓글을 작성할 수 없습니다.':
    "Admin accounts can't post or comment in the community.",
  'Google 장소 검색이 아직 설정되지 않았어요.':
    "Google place search isn't set up yet.",
  '장소 검색 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.':
    'Place search is having trouble. Please try again shortly.',
  '저장할 수 있는 장소를 찾지 못했어요.': "We couldn't find a place to save.",
  '현재 위치의 위도와 경도를 함께 보내 주세요.':
    'Please send both latitude and longitude for your location.',
  '여행 종료일은 시작일보다 빠를 수 없습니다.':
    "The trip can't end before it starts.",
  '여행 기록을 찾을 수 없습니다.': "We couldn't find that travel record.",

  // Reports and admin
  '자신의 콘텐츠나 계정은 신고할 수 없습니다.':
    "You can't report your own content or account.",
  '기타 신고 사유는 10자 이상 입력해 주세요.':
    "For 'Other', please describe the reason in at least 10 characters.",
  '이미 신고한 대상입니다.': 'You already reported this.',
  '이미 처리된 신고입니다.': 'This report was already handled.',
  '신고를 찾을 수 없습니다.': "We couldn't find that report.",
  '신고 대상을 찾을 수 없습니다.': "We couldn't find what you're reporting.",
  '신고 상태를 확인해 주세요.': 'Please check the report status.',
  '신고 대상 유형을 확인해 주세요.': 'Please check the report target type.',
  '처리 결정을 확인해 주세요.': 'Please check the decision.',
  '처리 메모를 확인해 주세요.': 'Please check the note.',
  '처리 메모는 300자 이하여야 합니다.':
    'Notes must be 300 characters or fewer.',
  '신고 대상을 확인해 주세요.': 'Please check what you are reporting.',
  '신고 대상 식별자가 너무 깁니다.': 'The report target ID is too long.',
  '신고 사유를 선택해 주세요.': 'Please choose a reason.',
  '상세 사유를 확인해 주세요.': 'Please check the details.',
  '상세 사유는 300자 이하여야 합니다.':
    'Details must be 300 characters or fewer.',

  // Preorders
  '이름을 입력해 주세요.': 'Please enter your name.',
  '이름은 30자 이내로 입력해 주세요.': 'Names can be up to 30 characters.',
  '올바른 이메일 주소를 입력해 주세요.': 'Please enter a valid email address.',
  '이메일은 320자 이내로 입력해 주세요.': 'Emails can be up to 320 characters.',
  '개인정보 수집 동의가 필요합니다.':
    'Please agree to the collection of personal information.',

  // Platform
  '데이터베이스 연결을 확인할 수 없습니다.':
    "We can't reach the database right now.",
  '서버에서 요청을 처리하지 못했습니다.':
    "The server couldn't handle the request.",
  '보낼 수 없는 항목이 들어 있어요.':
    'The request contains fields that are not allowed.',
  '입력값을 확인해 주세요.': 'Please check what you entered.',
};

const genericByStatus: Readonly<Record<number, string>> = {
  400: 'Please check your request and try again.',
  401: 'Please log in.',
  403: "You don't have access to this.",
  404: "We couldn't find what you were looking for.",
  409: 'This conflicts with the current state. Please refresh and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
};

const RATE_LIMIT = /^요청이 너무 많습니다\. (\d+)초 후 다시 시도해 주세요\.$/u;

/** English for a Korean API detail, falling back to a status-level message. */
export function englishDetail(detail: string, status: number): string {
  const exact = ENGLISH_DETAILS[detail];
  if (exact !== undefined) return exact;
  const rateLimit = RATE_LIMIT.exec(detail);
  if (rateLimit !== null) {
    return `Too many requests. Please try again in ${rateLimit[1]} seconds.`;
  }
  if (!/[가-힣]/u.test(detail)) return detail;
  return (
    genericByStatus[status] ??
    "We couldn't complete that. Please try again in a moment."
  );
}
