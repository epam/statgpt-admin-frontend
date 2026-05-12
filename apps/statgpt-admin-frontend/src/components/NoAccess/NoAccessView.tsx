import { Header } from '@/src/components/Header/Header';
import { NoAccess } from '@/src/components/NoAccess/NoAccess';

export function NoAccessView() {
  return (
    <div className="flex h-full flex-col">
      <Header showBreadcrumbs={false} />
      <NoAccess />
    </div>
  );
}
