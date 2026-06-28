import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const authServiceMock = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get(AuthController);
    jest.clearAllMocks();
  });

  it('register delegates to AuthService', async () => {
    authServiceMock.register.mockResolvedValue({ access_token: 'tok' });
    const dto = { email: 'a@b.com', password: 'pw', first_name: 'A', last_name: 'B' };
    const result = await controller.register(dto as any);
    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ access_token: 'tok' });
  });

  it('login delegates to AuthService', async () => {
    authServiceMock.login.mockResolvedValue({ access_token: 'tok' });
    const dto = { email: 'a@b.com', password: 'pw' };
    const result = await controller.login(dto as any);
    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ access_token: 'tok' });
  });
});
