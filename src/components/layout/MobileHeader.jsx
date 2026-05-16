import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function MobileHeader({ title, backTo, className }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div className={cn(
      'md:hidden flex items-center justify-center relative pt-safe-top pt-4 pb-2 mb-2',
      className
    )}>
      <button
        onClick={handleBack}
        className="absolute left-0 flex items-center justify-center h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Go back"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="text-base font-semibold text-foreground">{title}</h1>
    </div>
  );
}