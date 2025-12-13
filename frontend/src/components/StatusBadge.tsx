import { ApplicantStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicantStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    selected: {
      label: 'Selected',
      variant: 'default' as const,
      className: 'bg-success hover:bg-success/90 text-success-foreground',
      icon: CheckCircle2,
    },
    'not-selected': {
      label: 'Not Selected',
      variant: 'destructive' as const,
      className: '',
      icon: XCircle,
    },
    'future-select': {
      label: 'Future Select',
      variant: 'default' as const,
      className: 'bg-info hover:bg-info/90 text-info-foreground',
      icon: Clock,
    },
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      className: '',
      icon: Circle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
