import { Spinner } from '@components/ui/spinner';

type LoadingCardProps = {
  label: string;
};

export function LoadingCard({ label }: LoadingCardProps) {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Spinner aria-label={label} />
    </div>
  );
}
