interface Props {
  isCollapsed?: boolean;
}

export function MenuItemSkeleton({ isCollapsed = false }: Props) {
  if (isCollapsed) {
    return (
      <div className="size-8 mb-1 mx-auto rounded bg-layer-4 animate-pulse" />
    );
  }
  return <div className="h-8 mb-1 rounded bg-layer-4 animate-pulse" />;
}
