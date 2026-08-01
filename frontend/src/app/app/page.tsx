import Link from 'next/link';
import { RoomCard } from '@/components/rooms/room-card';
import { getRooms } from '@/lib/api/rooms.server';
import { getMyVerifications } from '@/lib/api/verifications.server';
import { requireUser } from '@/lib/auth/session';

export default async function AppHome(): Promise<React.JSX.Element> {
  const [user, rooms, verifications] = await Promise.all([
    requireUser('/app'),
    getRooms(),
    getMyVerifications(),
  ]);
  const approved = verifications.find((item) => item.status === 'APPROVED');
  const pending = verifications.find((item) => item.status === 'PENDING');
  const pendingTypes = new Set(
    verifications
      .filter((item) => item.status === 'PENDING')
      .map((item) => item.type),
  );
  const summary =
    approved !== undefined
      ? {
          title: `${approved.destination.nameKo} ${approved.type === 'TRAVELER' ? '여행자' : '현지인'} 인증 완료`,
          body: `${approved.destination.nameKo} 실시간 도움방에 참여할 수 있어요.`,
        }
      : pending !== undefined
        ? {
            title: `${pending.type === 'TRAVELER' ? '여행자' : '현지인'} 인증 심사 중`,
            body: '커뮤니티는 지금 이용할 수 있고, 승인 후 실시간방도 열려요.',
          }
        : {
            title: '아직 인증 전이에요',
            body: '커뮤니티는 바로 이용할 수 있고, 실시간방은 인증 후 열려요.',
          };

  return (
    <div className="appHome">
      <section className="homeGreeting" aria-labelledby="welcome-title">
        <div>
          <p>TRAVEL NETWORK</p>
          <h1 id="welcome-title">{user.nickname}님, 무엇이 궁금하세요?</h1>
        </div>
        <div className="qualificationSummary">
          <span aria-hidden="true">i</span>
          <div>
            <strong>{summary.title}</strong>
            <p>{summary.body}</p>
          </div>
        </div>
      </section>

      <Link className="communityLane" href="/app/community">
        <span className="communityLane__stamp" aria-hidden="true">
          OPEN
        </span>
        <div>
          <p>인증 없이 바로 참여</p>
          <h2>여행자 커뮤니티</h2>
          <span>
            목적지에 상관없이 궁금한 것을 묻고, 알고 있는 여행 정보를
            나눠보세요.
          </span>
        </div>
        <strong>정보 둘러보기 →</strong>
      </Link>

      <section className="homeSection" aria-labelledby="room-section-title">
        <div className="homeSection__heading">
          <div>
            <p>현재 열려 있는 지역</p>
            <h2 id="room-section-title">인증 실시간 도움방</h2>
          </div>
          <span>{rooms.length}개 지역</span>
        </div>
        {rooms.length === 0 ? (
          <div className="emptyState">
            <span aria-hidden="true">⌁</span>
            <h3>열려 있는 여행 도움방이 없어요</h3>
            <p>지역 정보가 준비되면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <div className="roomList">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      <section className="homeSection" aria-labelledby="qualification-title">
        <div className="homeSection__heading">
          <div>
            <p>방에 참여하려면</p>
            <h2 id="qualification-title">나에게 맞는 인증을 확인하세요</h2>
          </div>
        </div>
        <div className="qualificationGrid">
          {pendingTypes.has('TRAVELER') ? (
            <Link className="qualificationPending" href="/app/verifications">
              <span
                className="qualificationIcon qualificationIcon--traveler"
                aria-hidden="true"
              >
                ↗
              </span>
              <div>
                <strong>여행자 인증 심사 중</strong>
                <p>같은 유형은 심사가 끝난 뒤 다시 신청할 수 있어요.</p>
                <span>인증 현황에서 확인 →</span>
              </div>
            </Link>
          ) : (
            <Link href="/app/verifications/traveler">
              <span
                className="qualificationIcon qualificationIcon--traveler"
                aria-hidden="true"
              >
                ↗
              </span>
              <div>
                <strong>제주를 여행 중인가요?</strong>
                <p>여행 일정과 증빙을 준비해 질문할 수 있어요.</p>
                <span>여행자 인증 시작 →</span>
              </div>
            </Link>
          )}
          {pendingTypes.has('LOCAL') ? (
            <Link className="qualificationPending" href="/app/verifications">
              <span
                className="qualificationIcon qualificationIcon--local"
                aria-hidden="true"
              >
                ⌂
              </span>
              <div>
                <strong>현지인 인증 심사 중</strong>
                <p>같은 유형은 심사가 끝난 뒤 다시 신청할 수 있어요.</p>
                <span>인증 현황에서 확인 →</span>
              </div>
            </Link>
          ) : (
            <Link href="/app/verifications/local">
              <span
                className="qualificationIcon qualificationIcon--local"
                aria-hidden="true"
              >
                ⌂
              </span>
              <div>
                <strong>제주에 살고 있나요?</strong>
                <p>현재 위치와 거주 증빙을 준비해 답변할 수 있어요.</p>
                <span>현지인 인증 시작 →</span>
              </div>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
