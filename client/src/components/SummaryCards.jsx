import completeBadge from '../assets/icons/complete-badge.svg';
import pendingBadge from '../assets/icons/pending-badge.svg';

function Card({ label, count, caption, badge, badgeBg, cardBg, badgeSize }) {
  return (
    <div className={`flex h-24 gap-[11px] px-[15px] pt-4 ${cardBg}`}>
      <div className={`flex size-7 shrink-0 items-center justify-center ${badgeBg}`}>
        <img src={badge} alt="" style={{ width: badgeSize, height: badgeSize }} />
      </div>
      <div>
        <p className="text-xs leading-7 text-ink">{label}</p>
        <p className="mt-[3px] flex items-baseline gap-1">
          <span className="text-[22px] leading-none font-semibold text-ink">{String(count).padStart(2, '0')}</span>
          <span className="text-[10px] text-subtle">{caption}</span>
        </p>
      </div>
    </div>
  );
}

export default function SummaryCards({ completed, pending, caption = 'This Week' }) {
  return (
    <div className="grid grid-cols-2 gap-[17px]">
      <Card
        label="Task Complete"
        count={completed}
        caption={caption}
        badge={completeBadge}
        badgeSize={24}
        cardBg="bg-done-bg"
        badgeBg="bg-done-badge"
      />
      <Card
        label="Task Pending"
        count={pending}
        caption={caption}
        badge={pendingBadge}
        badgeSize={19.5}
        cardBg="bg-pending-bg"
        badgeBg="bg-pending-badge"
      />
    </div>
  );
}
