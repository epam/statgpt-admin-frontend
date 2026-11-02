/* global describe, it, expect, jest, afterEach */
import { DiscoveryIndexingStage } from '@/src/models/discovery-dataset';
import { ChannelsApi } from './channels-api';

describe('ChannelsApi.triggerDiscoveryIndexingJob', () => {
  afterEach(() => jest.restoreAllMocks());

  const triggerUrl = async (force: DiscoveryIndexingStage[]) => {
    const post = jest
      .spyOn(ChannelsApi.prototype, 'post')
      .mockResolvedValue({ ok: true, data: {} } as never);

    await new ChannelsApi().triggerDiscoveryIndexingJob('7', force, null);

    return post.mock.calls[0][0] as string;
  };

  it('sends no force parameter when no stage is forced', async () => {
    expect(await triggerUrl([])).toMatch(/indexing-jobs$/);
  });

  it('sends one force parameter per forced stage', async () => {
    const url = await triggerUrl([
      DiscoveryIndexingStage.Summarization,
      DiscoveryIndexingStage.Publishing,
    ]);

    expect(url).toMatch(/indexing-jobs\?force=summarization&force=publishing$/);
  });

  it('never sends a boolean force value', async () => {
    const url = await triggerUrl([DiscoveryIndexingStage.Publishing]);

    expect(url).toMatch(/\?force=publishing$/);
    expect(url).not.toMatch(/force=(true|false)/);
  });
});
