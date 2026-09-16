import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { APP_NAME } from '../../lib/constants.js';

/** Notes Heaven logo - open-book mark matching the UI design */
const Logo = ({ to = '/', size = 'md', className, showText = true }) => {
  const sizes = {
    sm: { box: 'h-7 w-7', icon: 15, text: 'text-[15px]' },
    md: { box: 'h-9 w-9', icon: 18, text: 'text-[17px]' },
    lg: { box: 'h-11 w-11', icon: 22, text: 'text-xl' },
  }[size];

  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className={cn('flex items-center justify-center rounded-[10px] bg-brand-700 text-white shadow-[0_2px_8px_rgba(29,78,216,.28)]', sizes.box)}>
        <BookOpen size={sizes.icon} strokeWidth={2.2} />
      </span>
      {showText && <span className={cn('font-bold tracking-[-0.01em] text-ink', sizes.text)}>{APP_NAME}</span>}
    </span>
  );

  return to ? (
    <Link to={to} className="inline-flex shrink-0 items-center" aria-label={APP_NAME}>
      {content}
    </Link>
  ) : (
    content
  );
};

export default Logo;
