import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  RegisterDto,
  REGISTER_PASSWORD_MESSAGE,
  REGISTER_PASSWORD_PATTERN,
} from './register.dto';

describe('RegisterDto', () => {
  it('rejects weak passwords', async () => {
    const weak = ['password', '12345678', 'Password1', 'Password!', 'passWord1'];
    for (const password of weak) {
      const dto = plainToInstance(RegisterDto, {
        email: 'a@b.com',
        password,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const pwdErr = errors.find((e) => e.property === 'password');
      expect(pwdErr?.constraints?.matches).toBe(REGISTER_PASSWORD_MESSAGE);
    }
  });

  it('accepts a compliant password', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: '  user@example.com  ',
      password: 'Password123!',
      displayName: '  Ada  ',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('user@example.com');
    expect(REGISTER_PASSWORD_PATTERN.test(dto.password)).toBe(true);
    expect(dto.displayName).toBe('Ada');
  });

  it('trims email and drops empty displayName', async () => {
    const dto = plainToInstance(RegisterDto, {
      email: '  trim@example.com ',
      password: 'Aa1!aaaa',
      displayName: '   ',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('trim@example.com');
    expect(dto.displayName).toBeUndefined();
  });
});
