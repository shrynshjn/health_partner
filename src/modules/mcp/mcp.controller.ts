import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(
    private readonly mcpService: McpService,
    private readonly jwt: JwtService,
  ) {}

  @All()
  async handle(@Req() req: Request, @Res() res: Response) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.setHeader(
        'WWW-Authenticate',
        'Bearer realm="health-partner", error="unauthorized"',
      );
      res.status(401).json({
        error: 'unauthorized',
        error_description: 'Bearer token required',
      });
      return;
    }

    let payload: { sub: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid or expired token',
      });
      return;
    }

    const server = this.mcpService.createServerForUser(payload.sub);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
}
