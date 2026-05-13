import { LoadingStateSetter } from '@/src/components/LoadingStateSetter/LoadingStateSetter';
import { PageLoader } from '@/src/components/PageLoader/PageLoader';

export default function Loading() {
  return (
    <>
      <LoadingStateSetter />
      <PageLoader />
    </>
  );
}
