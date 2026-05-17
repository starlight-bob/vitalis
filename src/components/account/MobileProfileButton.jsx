import { Link } from 'react-router-dom';

export default function MobileProfileButton({ user }) {
  return (
    <Link
      to="/account"
      className="md:hidden fixed top-14 left-4 z-40 h-9 w-9 rounded-full bg-card border border-border shadow-md overflow-hidden flex items-center justify-center"
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt="profile" className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-bold text-foreground">
          {(user?.full_name || user?.email || '?')[0].toUpperCase()}
        </span>
      )}
    </Link>
  );
}