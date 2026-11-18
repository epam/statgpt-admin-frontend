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

describe('ChannelsApi.exportChannelDiscoveryDatasets', () => {
  afterEach(() => jest.restoreAllMocks());

  const exportUrl = (
    params?: Parameters<ChannelsApi['exportChannelDiscoveryDatasets']>[2],
  ) => {
    const stream = jest
      .spyOn(
        ChannelsApi.prototype as unknown as {
          streamRequest: (url: string) => unknown;
        },
        'streamRequest',
      )
      .mockReturnValue({});

    new ChannelsApi().exportChannelDiscoveryDatasets('7', null, params);

    return stream.mock.calls[0][0] as string;
  };

  it('sends no query when nothing is requested', () => {
    expect(exportUrl()).toMatch(/channels\/7\/discovery-datasets\/export$/);
  });

  it('passes the filters through', () => {
    const url = exportUrl({
      agency: 'World Bank',
      validation_status: 'INVALID',
      indexing_status: 'NEW',
    });

    expect(url).toMatch(
      /\?agency=World\+Bank&validation_status=INVALID&indexing_status=NEW$/,
    );
  });

  it('passes the format and the validation flag through', () => {
    const url = exportUrl({ format: 'xlsx', include_validation: 'true' });

    expect(url).toMatch(/\?format=xlsx&include_validation=true$/);
  });

  it('sends one id parameter per selected id', () => {
    const url = exportUrl({ ids: ['3', '5', '8'] });

    expect(url).toMatch(/\?id=3&id=5&id=8$/);
  });
});
