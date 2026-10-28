/**
 * Branded page-load intro (≈1.3s, CSS only): the logo's sun rises over its
 * horizon, the wordmark lifts in, then the panel slides away. It shows once
 * per browser session (see INTRO_SCRIPT), never under reduced motion, and is
 * pointer-transparent the whole time, so it can't block clicks or keyboard use.
 */
export function Intro({ wordmark }: { wordmark: string }) {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-panel">
        <div className="flex flex-col items-center gap-5">
          <svg viewBox="0 0 64 40" className="w-20 overflow-visible">
            <circle cx="32" cy="26" r="16" className="intro-sun fill-sunset" />
            <rect x="0" y="27" width="64" height="20" className="fill-dusk" />
            <path d="M4 27.5h56" className="intro-horizon stroke-plaster" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M16 34h32"
              className="intro-horizon intro-horizon-2 stroke-plaster"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="mask-word">
            <span className="intro-word block font-display text-[2rem] tracking-[-0.02em] text-plaster">
              {wordmark}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Runs in <head> before first paint. Plays the intro only on the first page
 * of a session and only when motion is allowed; otherwise the page starts
 * immediately. If storage is blocked, the intro is skipped. The flag is cleared
 * once the opening sequence has finished, so later page changes never wait on it.
 */
export const INTRO_SCRIPT = `try{var d=document.documentElement;if(location.pathname.indexOf('/admin')!==0&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('intro-seen')){d.setAttribute('data-intro','play');sessionStorage.setItem('intro-seen','1');setTimeout(function(){d.removeAttribute('data-intro')},2300)}}catch(e){}`;
