import { Test, TestingModule } from '@nestjs/testing';
import { OAuthController } from './oauth.controller';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

const authServiceMock = { login: jest.fn() };
const configServiceMock = { get: jest.fn().mockReturnValue('http://localhost:3000') };

function makeRes() {
  return {
    setHeader: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;
}

describe('OAuthController', () => {
  let controller: OAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();
    controller = module.get(OAuthController);
    jest.clearAllMocks();
  });

  describe('GET /.well-known/oauth-authorization-server', () => {
    it('returns issuer and endpoint metadata', () => {
      const meta = controller.metadata();
      expect(meta.issuer).toBe('http://localhost:3000');
      expect(meta.authorization_endpoint).toContain('/oauth/authorize');
      expect(meta.token_endpoint).toContain('/oauth/token');
      expect(meta.grant_types_supported).toContain('authorization_code');
    });
  });

  describe('GET /oauth/authorize', () => {
    it('returns HTML login page', () => {
      const res = makeRes();
      controller.showLoginPage('claude-health-partner', 'http://callback', 'code', 'state123', '', '', res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('<form'));
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('state123'));
    });
  });

  describe('POST /oauth/authorize', () => {
    it('throws BadRequestException when email missing', async () => {
      const res = makeRes();
      await expect(
        controller.handleLogin('', 'pw', 'http://callback', '', '', '', res),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when redirect_uri missing', async () => {
      const res = makeRes();
      await expect(
        controller.handleLogin('a@b.com', 'pw', '', '', '', '', res),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws UnauthorizedException on bad credentials', async () => {
      authServiceMock.login.mockRejectedValue(new UnauthorizedException());
      const res = makeRes();
      await expect(
        controller.handleLogin('a@b.com', 'wrong', 'http://callback', 'state', '', '', res),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('redirects with auth code on valid login', async () => {
      authServiceMock.login.mockResolvedValue({ access_token: 'jwt-tok' });
      const res = makeRes();
      await controller.handleLogin('a@b.com', 'correct', 'http://callback', 'mystate', '', '', res);
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringMatching(/http:\/\/callback\?code=[a-f0-9]+&state=mystate/),
      );
    });
  });

  describe('POST /oauth/token', () => {
    it('throws BadRequestException for unsupported grant type', async () => {
      await expect(
        controller.exchangeToken('client_credentials', 'code', 'http://callback'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when code missing', async () => {
      await expect(
        controller.exchangeToken('authorization_code', '', 'http://callback'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws UnauthorizedException for unknown code', async () => {
      await expect(
        controller.exchangeToken('authorization_code', 'nonexistent-code', 'http://callback'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('full flow: authorize then exchange token', async () => {
      authServiceMock.login.mockResolvedValue({ access_token: 'real-jwt' });
      const redirectUri = 'http://callback';

      // Step 1: authorize
      const res = makeRes();
      await controller.handleLogin('a@b.com', 'correct', redirectUri, '', '', '', res);
      const redirectArg: string = res.redirect.mock.calls[0][0];
      const code = new URL(redirectArg).searchParams.get('code')!;
      expect(code).toBeTruthy();

      // Step 2: exchange
      const token = await controller.exchangeToken('authorization_code', code, redirectUri);
      expect(token.access_token).toBe('real-jwt');
      expect(token.token_type).toBe('Bearer');
    });

    it('throws on redirect_uri mismatch', async () => {
      authServiceMock.login.mockResolvedValue({ access_token: 'jwt' });
      const res = makeRes();
      await controller.handleLogin('a@b.com', 'pw', 'http://original', '', '', '', res);
      const redirectArg: string = res.redirect.mock.calls[0][0];
      const code = new URL(redirectArg).searchParams.get('code')!;
      await expect(
        controller.exchangeToken('authorization_code', code, 'http://different'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws if code used twice', async () => {
      authServiceMock.login.mockResolvedValue({ access_token: 'jwt' });
      const res = makeRes();
      await controller.handleLogin('a@b.com', 'pw', 'http://cb', '', '', '', res);
      const code = new URL(res.redirect.mock.calls[0][0]).searchParams.get('code')!;
      await controller.exchangeToken('authorization_code', code, 'http://cb');
      await expect(
        controller.exchangeToken('authorization_code', code, 'http://cb'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
