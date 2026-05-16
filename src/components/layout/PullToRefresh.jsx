import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const PULL_THRESHOLD = 70;

export default function PullToRefresh({ queryKeys = [], children }) {
  const queryClient = useQueryClient();
  const touchStartY = useRef(null);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > PULL_THRESHOLD) setPulling(true);
  };

  const handleTouchEnd = async () => {
    if (pulling) {
      setPulling(false);
      setRefreshing(true);
      await Promise.all(queryKeys.map(key => queryClient.invalidateQueries({ queryKey: key })));
      setRefreshing(false);
    }
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pulling || refreshing) && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      {children}
    </div>
  );
}