import { Test } from '@nestjs/testing';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { JwtService } from '@nestjs/jwt';

function makeRes() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
}

function makeReq(overrides: Partial<any> = {}) {
  return {
    headers: {},
    body: {},
    method: 'POST',
    ...overrides,
  } as any;
}

const mockServer = {
  connect: jest.fn().mockResolvedValue(undefined),
};

const mockTransportHandleRequest = jest.fn().mockResolvedValue(undefined);

jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: jest.fn().mockImplementation(() => ({
    handleRequest: mockTransportHandleRequest,
  })),
}));

describe('McpController', () => {
  let controller: McpController;
  let jwtService: JwtService;
  let mcpService: McpService;

  beforeEach(async () => {
    mockServer.connect.mockClear();
    mockTransportHandleRequest.mockClear();

    const module = await Test.createTestingModule({
      controllers: [McpController],
      providers: [
        { provide: McpService, useValue: { createServerForUser: jest.fn().mockReturnValue(mockServer) } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();
    controller = module.get(McpController);
    jwtService = module.get(JwtService);
    mcpService = module.get(McpService);
  });

  it('returns 401 with WWW-Authenticate when no token', async () => {
    const res = makeRes();
    await controller.handle(makeReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.setHeader).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('Bearer'));
  });

  it('returns 401 when token is invalid', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('invalid'));
    const res = makeRes();
    await controller.handle(makeReq({ headers: { authorization: 'Bearer bad-token' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'invalid_token' }));
  });

  it('creates a server for the authenticated user and handles request', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 'user-abc', email: 'a@b.com' });
    const res = makeRes();
    await controller.handle(makeReq({ headers: { authorization: 'Bearer valid-token' } }), res);
    expect(mcpService.createServerForUser).toHaveBeenCalledWith('user-abc');
    expect(mockServer.connect).toHaveBeenCalled();
    expect(mockTransportHandleRequest).toHaveBeenCalled();
  });
});
