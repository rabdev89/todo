import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;

  /** Login does not enforce register-style min length (avoids leaking policy via 400 vs 401). */
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(72)
  password!: string;
}
