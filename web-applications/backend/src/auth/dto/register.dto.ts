import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

function trimEmail({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalDisplayName({ value }: { value: unknown }) {
  if (typeof value !== 'string') return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

/** Matches T-106 / design: upper, lower, digit, one of !@#$%^&*, length 8–72 */
export const REGISTER_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,72}$/;

export const REGISTER_PASSWORD_MESSAGE =
  'Password must be 8–72 characters and include uppercase, lowercase, a number, and a special character (!@#$%^&*)';

export class RegisterDto {
  @Transform(trimEmail)
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @Transform(trimOptionalDisplayName)
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @IsString()
  @MaxLength(72)
  @Matches(REGISTER_PASSWORD_PATTERN, { message: REGISTER_PASSWORD_MESSAGE })
  password!: string;
}
