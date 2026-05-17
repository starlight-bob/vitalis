import { Link } from 'react-router-dom';
import { Watch } from 'lucide-react';

// Simulated battery — in a real app this would come from a connected device
const MOCK_BATTERY = 72;

function getBatteryColor(pct) {
  if (pct >= 75) return 'text-emerald-400';
  if (pct >= 30) return 'text-yellow-400';
  return 'text-red-400';
}

export default function MobileWatchButton() {
  const color = getBatteryColor(MOCK_BATTERY);

  return (
    <Link
      to="/device-settings"
      className="md:hidden fixed top-14 right-4 z-40 flex flex-col items-center gap-0.5"
    >
      <div className="h-9 w-9 rounded-full bg-card border border-border shadow-md flex items-center justify-center">
        <Watch className="h-4 w-4 text-foreground" />
      </div>
      <span className={`text-[9px] font-semibold leading-none ${color}`}>
        {MOCK_BATTERY}%
      </span>
    </Link>
  );
}