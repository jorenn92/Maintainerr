import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync, renameSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { dataDir } from '../../../app/config/dataDir';
import { MaintainerrLogger } from '../../logging/logs.service';
import { ExternalApiService } from '../external-api/external-api.service';
import cacheManager from '../lib/cache';

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  html_url: string;
  created_at: string;
  published_at: string;
}

export interface GitHubCommit {
  sha: string;
}

type PersistedCacheEntry = { value: unknown; expiresAt: number };

@Injectable()
export class GitHubApiService extends ExternalApiService {
  private githubCache = cacheManager.getCache('github');
  private readonly cacheFilePath = join(dataDir, 'github-cache.json');
  private persistedEntries: Record<string, PersistedCacheEntry> = {};
  private persistQueue: Promise<void> = Promise.resolve();

  constructor(protected readonly logger: MaintainerrLogger) {
    logger.setContext(GitHubApiService.name);
    const token = process.env.GITHUB_TOKEN;
    super('https://api.github.com', {}, logger, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    this.loadPersistedCache();

    if (token) {
      logger.log('GitHub API authentication configured with provided token');
    }
  }

  private quarantineCorruptCacheFile(): void {
    if (!existsSync(this.cacheFilePath)) return;

    try {
      renameSync(
        this.cacheFilePath,
        `${this.cacheFilePath}.corrupt-${Date.now()}`,
      );
    } catch (error) {
      this.logger.warn(
        'Failed to quarantine corrupt GitHub cache persistence file.',
      );
      this.logger.debug(error);
    }
  }

  private loadPersistedCache(): void {
    try {
      if (!existsSync(this.cacheFilePath)) return;
      const entries: Record<string, PersistedCacheEntry> = JSON.parse(
        readFileSync(this.cacheFilePath, 'utf8'),
      );
      const now = Date.now();
      for (const [key, { value, expiresAt }] of Object.entries(entries)) {
        const remainingTtl = Math.floor((expiresAt - now) / 1000);
        if (remainingTtl > 0) {
          this.githubCache?.data.set(key, value, remainingTtl);
          this.persistedEntries[key] = { value, expiresAt };
        }
      }
    } catch (error) {
      this.logger.warn(
        'GitHub cache persistence file is corrupt. Ignoring persisted entries.',
      );
      this.logger.debug(error);
      this.persistedEntries = {};
      this.quarantineCorruptCacheFile();
    }
  }

  private queuePersistedCacheWrite(
    entriesSnapshot: Record<string, PersistedCacheEntry>,
  ): void {
    this.persistQueue = this.persistQueue
      .catch(() => undefined)
      .then(async () => {
        try {
          await writeFile(
            this.cacheFilePath,
            JSON.stringify(entriesSnapshot),
            'utf8',
          );
        } catch {
          // Silently ignore write errors (e.g. read-only filesystem)
        }
      });
  }

  private persistCacheEntry(key: string, value: unknown): void {
    const now = Date.now();

    for (const persistedKey of Object.keys(this.persistedEntries)) {
      if (this.persistedEntries[persistedKey].expiresAt <= now) {
        delete this.persistedEntries[persistedKey];
      }
    }

    const ttlMs = (this.githubCache?.data.options.stdTTL ?? 86400) * 1000;
    this.persistedEntries[key] = { value, expiresAt: now + ttlMs };

    this.queuePersistedCacheWrite({ ...this.persistedEntries });
  }

  /**
   * Get the latest release for a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @returns Latest release information or undefined if unavailable
   */
  public async getLatestRelease(
    owner: string,
    repo: string,
  ): Promise<GitHubRelease | undefined> {
    const cacheKey = `release:${owner}/${repo}:latest`;
    const cached = this.githubCache?.data.get<GitHubRelease>(cacheKey);
    if (cached) {
      return cached;
    }

    const release = await this.getWithoutCache<GitHubRelease>(
      `/repos/${owner}/${repo}/releases/latest`,
    );
    if (!release) {
      return undefined;
    }

    this.githubCache?.data.set(cacheKey, release);
    this.persistCacheEntry(cacheKey, release);

    return release;
  }

  /**
   * Get a specific commit from a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param ref Commit SHA or branch name
   * @returns Commit information or undefined if unavailable
   */
  public async getCommit(
    owner: string,
    repo: string,
    ref: string,
  ): Promise<GitHubCommit | undefined> {
    const cacheKey = `commit:${owner}/${repo}:${ref}`;
    const cached = this.githubCache?.data.get<GitHubCommit>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.getWithoutCache<GitHubCommit>(
      `/repos/${owner}/${repo}/commits/${ref}`,
    );
    if (!response) {
      return undefined;
    }

    const commit = { sha: response.sha };

    this.githubCache?.data.set(cacheKey, commit);
    this.persistCacheEntry(cacheKey, commit);

    return commit;
  }

  /**
   * Get multiple releases for a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param perPage Number of releases to fetch (default: 10)
   * @returns Array of releases or undefined if unavailable
   */
  public async getReleases(
    owner: string,
    repo: string,
    perPage: number = 10,
  ): Promise<GitHubRelease[] | undefined> {
    const cacheKey = `releases:${owner}/${repo}:${perPage}`;
    const cached = this.githubCache?.data.get<GitHubRelease[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const releases = await this.getWithoutCache<GitHubRelease[]>(
      `/repos/${owner}/${repo}/releases`,
      { params: { per_page: perPage } },
    );
    if (!releases) {
      return undefined;
    }

    this.githubCache?.data.set(cacheKey, releases);
    this.persistCacheEntry(cacheKey, releases);

    return releases;
  }
}
