import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('rejects empty email or password', async () => {
    const empty = plainToInstance(LoginDto, { email: '', password: '' });
    const e1 = await validate(empty);
    expect(e1.length).toBeGreaterThan(0);

    const noPwd = plainToInstance(LoginDto, {
      email: 'a@b.com',
      password: '',
    });
    const e2 = await validate(noPwd);
    expect(e2.some((x) => x.property === 'password')).toBe(true);
  });

  it('accepts valid credentials shape', async () => {
    const dto = plainToInstance(LoginDto, {
      email: '  user@example.com ',
      password: 'x',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.email).toBe('user@example.com');
  });
});
