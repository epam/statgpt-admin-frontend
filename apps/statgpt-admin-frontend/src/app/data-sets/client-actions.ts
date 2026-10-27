/**
 * Client-side version of the data set server actions: it refreshes the session
 * and retries once when the backend answers 401. Client components must import
 * from here instead of `./actions`.
 */
import { withAuthRetryAction } from '@/src/utils/client/auth-retry';
import { createDataSet as createDataSetAction } from './actions';

export const createDataSet = withAuthRetryAction(createDataSetAction);
