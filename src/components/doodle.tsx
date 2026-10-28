/** The cut-paper doodle beside "What we do". Animated in os.css. */
export function Doodle() {
  return (
    <svg className="services-doodle" viewBox="0 0 640 240" aria-hidden="true" focusable="false">
                    <path className="doodle-trail" d="M40 190 C 120 120, 150 60, 230 92 S 360 200, 430 120 S 560 40, 610 70" />
                    <g className="doodle doodle--sun"><circle cx="70" cy="70" r="46" /></g>
                    <g className="doodle doodle--site">
                        <rect x="250" y="120" width="150" height="96" rx="8" />
                        <path d="M250 142 H400" />
                        <circle cx="266" cy="131" r="3.5" /><circle cx="278" cy="131" r="3.5" /><circle cx="290" cy="131" r="3.5" />
                        <rect className="doodle-cta" x="266" y="186" width="56" height="14" rx="7" />
                    </g>
                    <g className="doodle doodle--spark"><path d="M520 30 L530 62 L562 72 L530 82 L520 114 L510 82 L478 72 L510 62 Z" /></g>
                    <g className="doodle doodle--bars">
                        <rect x="150" y="160" width="16" height="40" /><rect x="172" y="140" width="16" height="60" /><rect x="194" y="112" width="16" height="88" />
                    </g>
                </svg>
  );
}
