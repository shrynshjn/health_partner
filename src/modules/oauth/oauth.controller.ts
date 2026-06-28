import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';

interface AuthCodeEntry {
  userId: string;
  email: string;
  expiresAt: number;
  redirectUri: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

const authCodes = new Map<string, AuthCodeEntry>();

@Controller()
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private servePublicFile(file: string, contentType: string, res: Response) {
    const filePath = join(__dirname, '..', '..', '..', '..', 'public', file);
    if (!existsSync(filePath)) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    createReadStream(filePath).pipe(res);
  }

  @Get('/favicon.ico')
  favicon(@Res() res: Response) {
    this.servePublicFile('favicon.ico', 'image/x-icon', res);
  }

  @Get('/icon')
  icon(@Res() res: Response) {
    this.servePublicFile('icon-192.png', 'image/png', res);
  }

  @Get('/icon.png')
  iconPng(@Res() res: Response) {
    this.servePublicFile('icon-192.png', 'image/png', res);
  }

  @Get('/apple-touch-icon.png')
  appleTouchIcon(@Res() res: Response) {
    this.servePublicFile('icon-192.png', 'image/png', res);
  }

  @Get('/.well-known/oauth-authorization-server')
  metadata() {
    const base = this.config.get<string>('APP_URL') || 'http://localhost:3000';
    return {
      issuer: base,
      authorization_endpoint: `${base}/oauth/authorize`,
      token_endpoint: `${base}/oauth/token`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      code_challenge_methods_supported: ['S256', 'plain'],
      scopes_supported: ['health'],
      service_documentation: `${base}/api-docs`,
      logo_uri: `${base}/logo.png`,
    };
  }

  @Get('/oauth/authorize')
  showLoginPage(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('response_type') responseType: string,
    @Query('state') state: string,
    @Query('code_challenge') codeChallenge: string,
    @Query('code_challenge_method') codeChallengeMethod: string,
    @Res() res: Response,
  ) {
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Health Partner – Sign In</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 40px 36px;
      width: 100%;
      max-width: 400px;
    }
    h1 { font-size: 22px; font-weight: 600; margin-bottom: 6px; color: #111; }
    p { font-size: 14px; color: #666; margin-bottom: 28px; }
    label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 6px; }
    input {
      width: 100%; padding: 10px 12px; border: 1.5px solid #ddd;
      border-radius: 8px; font-size: 15px; outline: none; transition: border 0.2s;
    }
    input:focus { border-color: #4f8ef7; }
    .field { margin-bottom: 18px; }
    button {
      width: 100%; padding: 12px; background: #4f8ef7; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 600;
      cursor: pointer; margin-top: 4px; transition: background 0.2s;
    }
    button:hover { background: #3a7de0; }
    .error { color: #d32f2f; font-size: 13px; margin-top: 12px; display: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Health Partner</h1>
    <p>Sign in to connect your health data with Claude.</p>
    <form method="POST" action="/oauth/authorize">
      <input type="hidden" name="client_id" value="${clientId || ''}" />
      <input type="hidden" name="redirect_uri" value="${redirectUri || ''}" />
      <input type="hidden" name="response_type" value="${responseType || 'code'}" />
      <input type="hidden" name="state" value="${state || ''}" />
      <input type="hidden" name="code_challenge" value="${codeChallenge || ''}" />
      <input type="hidden" name="code_challenge_method" value="${codeChallengeMethod || ''}" />
      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="you@example.com" required />
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="••••••••" required />
      </div>
      <button type="submit">Sign in &amp; Connect</button>
    </form>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Post('/oauth/authorize')
  async handleLogin(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('redirect_uri') redirectUri: string,
    @Body('state') state: string,
    @Body('code_challenge') codeChallenge: string,
    @Body('code_challenge_method') codeChallengeMethod: string,
    @Res() res: Response,
  ) {
    if (!email || !password) throw new BadRequestException('email and password required');
    if (!redirectUri) throw new BadRequestException('redirect_uri required');

    let tokenResult: { access_token: string };
    try {
      tokenResult = await this.authService.login({ email, password });
    } catch {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Decode the JWT to get userId (we'll store the token itself as the code payload)
    const code = randomBytes(32).toString('hex');
    const entry: AuthCodeEntry = {
      userId: '',
      email,
      expiresAt: Date.now() + 5 * 60 * 1000,
      redirectUri,
      codeChallenge: codeChallenge || undefined,
      codeChallengeMethod: codeChallengeMethod || undefined,
    };
    // Store the access_token in the code entry so we can return it on exchange
    (entry as any).access_token = tokenResult.access_token;
    authCodes.set(code, entry);

    const separator = redirectUri.includes('?') ? '&' : '?';
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : '';
    res.redirect(`${redirectUri}${separator}code=${code}${stateParam}`);
  }

  @Post('/oauth/token')
  async exchangeToken(
    @Body('grant_type') grantType: string,
    @Body('code') code: string,
    @Body('redirect_uri') redirectUri: string,
  ) {
    if (grantType !== 'authorization_code') {
      throw new BadRequestException('Only authorization_code grant supported');
    }
    if (!code) throw new BadRequestException('code required');

    const entry = authCodes.get(code);
    if (!entry) throw new UnauthorizedException('Invalid or expired code');
    if (Date.now() > entry.expiresAt) {
      authCodes.delete(code);
      throw new UnauthorizedException('Code expired');
    }
    if (entry.redirectUri !== redirectUri) {
      throw new UnauthorizedException('redirect_uri mismatch');
    }

    authCodes.delete(code);
    const accessToken = (entry as any).access_token;

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 7 * 24 * 3600,
    };
  }
}
