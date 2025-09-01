import { redirect } from 'next/navigation';
import { MenuUrl } from '@/src/constants/menu';

export default function Page() {
  redirect(MenuUrl.DATA_SOURCES);
}
