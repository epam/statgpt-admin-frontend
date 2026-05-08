import type { ApiError } from './api';

export const parseApiError = async (response: Response): Promise<ApiError> => {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  if (contentType.includes('application/json')) {
    const payload = (await response.json()) as {
      detail?: unknown;
      message?: string;
      error?: string;
    };

    if (typeof payload.message === 'string' && payload.message) {
      return {
        status: response.status,
        message: payload.message,
        details: payload.detail,
        raw: payload,
      };
    }

    if (Array.isArray(payload.detail) && payload.detail.length > 0) {
      const validationMessage = payload.detail
        .map((item) => formatValidationMessage(item))
        .filter(Boolean)
        .join('; ');

      return {
        status: response.status,
        message: validationMessage || 'Validation failed',
        details: payload.detail,
        raw: payload,
      };
    }

    if (typeof payload.detail === 'string' && payload.detail) {
      return {
        status: response.status,
        message: payload.detail,
        details: payload.detail,
        raw: payload,
      };
    }

    if (typeof payload.error === 'string' && payload.error) {
      return {
        status: response.status,
        message: payload.error,
        raw: payload,
      };
    }

    return {
      status: response.status,
      message: `Request failed with status ${response.status}`,
      raw: payload,
    };
  }

  const text = await response.text();
  return {
    status: response.status,
    message: text || `Request failed with status ${response.status}`,
    raw: text,
  };
};

const formatValidationMessage = (item: unknown): string => {
  if (!item || typeof item !== 'object') {
    return '';
  }

  const typedItem = item as { loc?: unknown[]; msg?: unknown; type?: unknown };

  const locTokens = Array.isArray(typedItem.loc)
    ? typedItem.loc
        .map((token) => String(token))
        .filter((token) => !['body', 'query', 'path'].includes(token))
    : [];
  const fieldName = locTokens.length > 0 ? locTokens[locTokens.length - 1] : '';

  const msg = typeof typedItem.msg === 'string' ? typedItem.msg : '';
  const errorType = typeof typedItem.type === 'string' ? typedItem.type : '';
  const normalizedMsg = msg.toLowerCase();

  if (
    normalizedMsg.includes('field required') ||
    normalizedMsg.includes('missing')
  ) {
    return fieldName
      ? `Missing required field: ${fieldName}`
      : 'Missing required field';
  }

  if (
    normalizedMsg.includes('valid') ||
    normalizedMsg.includes('invalid') ||
    normalizedMsg.includes('type') ||
    errorType.includes('type_error')
  ) {
    return fieldName ? `Invalid value for ${fieldName}` : 'Invalid value';
  }

  if (msg) {
    return fieldName ? `${fieldName}: ${msg}` : msg;
  }

  if (fieldName) {
    return `Validation error in ${fieldName}`;
  }

  return 'Validation error';
};
