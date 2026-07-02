import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

/**
 * Lightweight in-memory brute-force guard for auth endpoints.
 * Keyed by IP + route so login and register are limited independently.
 * In-memory only: resets on process restart and isn't shared across instances,
 * which is fine for this single-process deployment.
 */
@Injectable()
export class AuthThrottleGuard implements CanActivate {
  private readonly hits = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const key = `${req.ip}:${req.route?.path ?? req.path}`;
    const now = Date.now();

    const timestamps = (this.hits.get(key) ?? []).filter(
      t => now - t < WINDOW_MS,
    );

    if (timestamps.length >= MAX_ATTEMPTS) {
      this.hits.set(key, timestamps);
      throw new HttpException(
        'Too many attempts, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    // Bound memory: only ever prune when the map has grown large, so the
    // common case (few distinct IPs) does no extra work.
    if (this.hits.size > 5000) {
      for (const [k, v] of this.hits) {
        const fresh = v.filter(t => now - t < WINDOW_MS);
        if (fresh.length === 0) this.hits.delete(k);
        else this.hits.set(k, fresh);
      }
    }
    return true;
  }
}
