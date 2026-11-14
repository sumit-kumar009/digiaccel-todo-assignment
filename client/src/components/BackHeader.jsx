import { useNavigate } from 'react-router-dom';
import arrowLeft from '../assets/icons/arrow-left.svg';

export default function BackHeader({ title }) {
  const navigate = useNavigate();

  function goBack() {
    // Go back if we came from inside the app, otherwise go home
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/home');
  }

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={goBack} aria-label="Go back" className="-m-1 p-1">
        <img src={arrowLeft} alt="" className="size-6" />
      </button>
      {title && <h1 className="text-lg font-semibold text-ink">{title}</h1>}
    </div>
  );
}
