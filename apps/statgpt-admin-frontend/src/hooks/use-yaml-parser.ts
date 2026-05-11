'use client';

import { useCallback } from 'react';
import { parse } from 'yaml';

import { useNotification } from '@/src/context/NotificationContext';
import { NotificationType } from '@/src/models/notification';

type ParseResult<T = Record<string, unknown>> =
  | { ok: true; value: T }
  | { ok: false };

/**
 * Returns a stable `parseYaml` function that parses a YAML string and
 * automatically shows an error toast notification on invalid syntax.
 */
export function useYamlParser() {
  const { showNotification } = useNotification();

  return useCallback(
    <T = Record<string, unknown>>(raw: string): ParseResult<T> => {
      try {
        return { ok: true, value: parse(raw) as T };
      } catch (e) {
        showNotification({
          type: NotificationType.error,
          title: 'Invalid Configuration',
          description:
            e instanceof Error
              ? e.message
              : 'YAML syntax error in configuration.',
        });
        return { ok: false };
      }
    },
    [showNotification],
  );
}
