import { cn, initials } from '../../lib/utils.js';

/** User avatar - image nahi to initials */
const Avatar = ({ user, size = 32, className }) => {
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} style={{ width: size, height: size }} className={cn('rounded-full object-cover', className)} />;
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-brand-700 font-semibold text-white', className)}
    >
      {initials(user?.name)}
    </span>
  );
};

export default Avatar;
