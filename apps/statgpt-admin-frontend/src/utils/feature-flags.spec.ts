import { getIsDiscoveryDatasetsEnabled } from './feature-flags';

describe('getIsDiscoveryDatasetsEnabled', () => {
  const originalValue = process.env.ENABLE_DISCOVERY_DATASETS;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.ENABLE_DISCOVERY_DATASETS;
    } else {
      process.env.ENABLE_DISCOVERY_DATASETS = originalValue;
    }
  });

  it('is disabled when the variable is unset', () => {
    delete process.env.ENABLE_DISCOVERY_DATASETS;

    expect(getIsDiscoveryDatasetsEnabled()).toBe(false);
  });

  it('is enabled when the variable is "true"', () => {
    process.env.ENABLE_DISCOVERY_DATASETS = 'true';

    expect(getIsDiscoveryDatasetsEnabled()).toBe(true);
  });

  it('is enabled for a padded, upper-case "TRUE"', () => {
    process.env.ENABLE_DISCOVERY_DATASETS = ' TRUE ';

    expect(getIsDiscoveryDatasetsEnabled()).toBe(true);
  });

  it('is disabled when the variable is "false"', () => {
    process.env.ENABLE_DISCOVERY_DATASETS = 'false';

    expect(getIsDiscoveryDatasetsEnabled()).toBe(false);
  });

  it('is disabled for a value that is not a boolean', () => {
    process.env.ENABLE_DISCOVERY_DATASETS = 'yes';

    expect(getIsDiscoveryDatasetsEnabled()).toBe(false);
  });
});
