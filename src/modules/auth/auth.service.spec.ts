import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../user/user.schema';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const VALID_OID = '507f1f77bcf86cd799439011';

const mockUser = {
  _id: VALID_OID,
  email: 'test@example.com',
  password: 'hashed',
};

const userModelMock = {
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModelMock },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('jwt-token') } },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws if email already exists', async () => {
      userModelMock.findOne.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@example.com', password: 'pass', first_name: 'A', last_name: 'B' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('hashes password and returns token', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      userModelMock.create.mockResolvedValue(mockUser);
      const result = await service.register({ email: 'new@example.com', password: 'pass', first_name: 'A', last_name: 'B' } as any);
      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: String(mockUser._id),
        email: mockUser.email,
      });
    });
  });

  describe('login', () => {
    it('throws if user not found', async () => {
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      await expect(service.login({ email: 'no@example.com', password: 'pass' })).rejects.toThrow(UnauthorizedException);
    });

    it('throws if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      userModelMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ ...mockUser, password: hashedPassword }),
      });
      await expect(service.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });

    it('returns token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      userModelMock.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ ...mockUser, password: hashedPassword }),
      });
      const result = await service.login({ email: 'test@example.com', password: 'correct' });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });
  });
});
