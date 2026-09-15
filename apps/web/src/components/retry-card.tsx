import { CircleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { Button } from '@components/ui/button';

type RetryCardProps = {
  title: string;
  description: string;
  onRetry: () => void;
};

export function RetryCard({ title, description, onRetry }: RetryCardProps) {
  return (
    <Alert
      variant="destructive"
      className="flex min-h-48 flex-col items-center justify-center gap-4 text-center"
    >
      <CircleAlert />
      <div className="flex flex-col items-center gap-1">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </div>
      <Button variant="secondary" onClick={onRetry}>
        Tentar novamente
      </Button>
    </Alert>
  );
}
