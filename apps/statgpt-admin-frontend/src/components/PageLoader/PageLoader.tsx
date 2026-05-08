import LoaderSmall from '@/src/components/BaseComponents/Loader/Loader';

export function PageLoader() {
  return (
    <div className="flex flex-col h-full rounded bg-layer-2 common-paddings">
      <div className="flex flex-row items-center justify-between">
        <div className="h-7 w-48 rounded bg-layer-3 animate-pulse" />
        <div className="h-8 w-20 rounded bg-layer-3 animate-pulse" />
      </div>
      <div className="flex-1 min-h-0 mt-4">
        <LoaderSmall />
      </div>
    </div>
  );
}
