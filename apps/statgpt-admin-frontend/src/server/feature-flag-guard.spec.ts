/**
 * @jest-environment node
 */
import {
  guardDiscoveryDatasetsEnabled,
  guardDiscoveryDatasetsEnabledResult,
} from './feature-flag-guard';

describe('guardDiscoveryDatasetsEnabled', () => {
  const originalValue = process.env.ENABLE_DISCOVERY_DATASETS;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.ENABLE_DISCOVERY_DATASETS;
    } else {
      process.env.ENABLE_DISCOVERY_DATASETS = originalValue;
    }
  });

  it('lets the request through when the feature is enabled', () => {
    process.env.ENABLE_DISCOVERY_DATASETS = 'true';

    expect(guardDiscoveryDatasetsEnabled()).toBeNull();
  });

  it('answers with a 404 Not Found when the feature is disabled', async () => {
    delete process.env.ENABLE_DISCOVERY_DATASETS;

    const response = guardDiscoveryDatasetsEnabled();

    expect(response?.status).toBe(404);
    await expect(response?.json()).resolves.toEqual({ error: 'Not Found' });
  });
});

describe('guardDiscoveryDatasetsEnabledResult', () => {
  const originalValue = process.env.ENABLE_DISCOVERY_DATASETS;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.ENABLE_DISCOVERY_DATASETS;
    } else {
      process.env.ENABLE_DISCOVERY_DATASETS = originalValue;
    }
  });

  it('lets the action through when the feature is enabled', () => {
    process.env.ENABLE_DISCOVERY_DATASETS = 'true';

    expect(guardDiscoveryDatasetsEnabledResult()).toBeNull();
  });

  it('answers with a failed 404 result when the feature is disabled', () => {
    delete process.env.ENABLE_DISCOVERY_DATASETS;

    expect(guardDiscoveryDatasetsEnabledResult()).toEqual({
      ok: false,
      error: { status: 404, message: 'Not Found' },
    });
  });
});
