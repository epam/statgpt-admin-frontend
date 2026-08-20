import { logger } from './logger';

/**
 * Server-only. Validates the upstream URL configuration once per process and
 * logs what the app will actually call, so a misconfigured environment is
 * visible at startup instead of only as a failed request later on.
 */

interface UrlCheck {
  name: string;
  value?: string;
  required: boolean;
}

const describeUrl = (check: UrlCheck) => {
  const problems: string[] = [];

  if (!check.value) {
    problems.push(check.required ? 'not set' : 'not set (optional)');
    return { host: '<empty>', origin: '<empty>', problems };
  }

  if (/\s/.test(check.value)) {
    problems.push('contains whitespace (check for a stray CR/LF in .env)');
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(check.value.trim());
  } catch {
    problems.push(
      'is not a valid absolute URL - it must start with "http://" or "https://"',
    );
    return { host: '<invalid>', origin: '<invalid>', problems };
  }

  if (check.value.trim().endsWith('/')) {
    problems.push('ends with "/" - request paths already start with "/"');
  }

  return { host: parsed.host, origin: parsed.origin, problems };
};

let alreadyLogged = false;

export const logApiConfiguration = () => {
  if (alreadyLogged) {
    return;
  }
  alreadyLogged = true;

  const checks: UrlCheck[] = [
    { name: 'API_URL', value: process.env.API_URL, required: true },
    { name: 'DIAL_API_URL', value: process.env.DIAL_API_URL, required: false },
  ];

  const summary: Record<string, unknown> = {
    nodeEnv: process.env.NODE_ENV,
    dialApiKey: process.env.DIAL_API_KEY ? '<set>' : '<empty>',
    requestTracing: process.env.API_DEBUG === 'true' ? 'on' : 'off (API_DEBUG)',
  };

  const problems: string[] = [];

  for (const check of checks) {
    const { host, origin, problems: urlProblems } = describeUrl(check);
    summary[check.name] = origin;
    urlProblems.forEach((problem) => problems.push(`${check.name} ${problem}`));

    // A preview/ephemeral namespace host is a frequent source of ENOTFOUND
    // once the environment behind it has been torn down.
    if (/-pr-\d+\./.test(host)) {
      problems.push(
        `${check.name} points at an ephemeral preview environment ("${host}") - it stops resolving once that environment is deleted`,
      );
    }
  }

  logger.info(summary, 'Upstream API configuration');

  if (problems.length > 0) {
    logger.warn({ problems }, 'Upstream API configuration warnings');
  }
};
