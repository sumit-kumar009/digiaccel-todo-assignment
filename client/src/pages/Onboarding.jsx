import { useNavigate } from 'react-router-dom';
import zigzag from '../assets/icons/zigzag.svg';
import ring from '../assets/icons/ring.svg';

export const ONBOARDING_KEY = 'todo:onboarded';

function Zigzag({ className }) {
  return (
    <div className={`absolute flex h-[189px] w-[190px] items-center justify-center ${className}`}>
      <img src={zigzag} alt="" className="h-[151px] w-[117.5px] max-w-none rotate-[46.43deg]" />
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();

  function getStarted() {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      /* storage can be blocked – onboarding will just show again */
    }
    navigate('/home', { replace: true });
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <div className="relative min-h-[320px] flex-1 overflow-hidden bg-primary" aria-hidden="true">
        <img src={ring} alt="" className="absolute -top-[46px] -right-[18px] size-[88px]" />
        <Zigzag className="top-[54px] -left-[44px]" />
        <Zigzag className="-right-10 -bottom-[19px]" />
      </div>

      <div className="flex h-[292px] shrink-0 flex-col px-6 pt-6 pb-8">
        <h1 className="text-2xl font-semibold text-black">Manage What To Do</h1>
        <p className="mt-4 max-w-[307px] text-xs leading-[18px] text-muted">
          The best way to manage what you have to do, don&apos;t forget your plans
        </p>
        <button
          type="button"
          onClick={getStarted}
          className="mt-auto h-12 w-full bg-primary text-base font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
