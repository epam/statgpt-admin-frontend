/** @jest-environment node */
/* global describe, it, expect */
import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) =>
  readFileSync(join(__dirname, relativePath), 'utf8');

const exportedActionNames = (source: string) =>
  [
    ...source.matchAll(/^export (?:async )?function (\w+)/gm),
    ...source.matchAll(/^export const (\w+) = async/gm),
  ]
    .map((match) => match[1])
    .sort();

const wrappedActions = (source: string) =>
  [
    ...source.matchAll(
      /^export const (\w+) = withAuthRetryAction\(\s*(\w+)Action,?\s*\);$/gm,
    ),
  ].map((match) => ({ exported: match[1], wrapped: match[2] }));

describe.each([
  ['channels', 'channels/actions.ts', 'channels/client-actions.ts'],
  ['data-sources', 'data-sources/actions.ts', 'data-sources/client-actions.ts'],
])('%s client actions', (_name, actionsPath, clientActionsPath) => {
  const clientSource = readSource(clientActionsPath);
  const wrapped = wrappedActions(clientSource);

  it('wraps every server action, none is missing', () => {
    expect(wrapped.map((item) => item.exported).sort()).toEqual(
      exportedActionNames(readSource(actionsPath)),
    );
  });

  it('exports each wrapper under the name of the action it wraps', () => {
    expect(wrapped.filter((item) => item.exported !== item.wrapped)).toEqual(
      [],
    );
  });

  it('imports every wrapped action from the actions module', () => {
    const importBlock = clientSource.match(
      /import \{([^}]*)\} from '\.\/actions';/,
    )?.[1];

    const imported = [...(importBlock ?? '').matchAll(/(\w+) as \w+Action/g)]
      .map((match) => match[1])
      .sort();

    expect(imported).toEqual(wrapped.map((item) => item.wrapped).sort());
  });
});
