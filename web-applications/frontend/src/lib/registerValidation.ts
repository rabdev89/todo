/** Keep in sync with backend `RegisterDto` password rule */
export const REGISTER_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,72}$/

export function getPasswordHint(password: string): string | null {
  if (!password) return 'Enter a password'
  if (password.length < 8 || password.length > 72)
    return 'Use 8–72 characters'
  if (!/[a-z]/.test(password)) return 'Add a lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Add an uppercase letter'
  if (!/\d/.test(password)) return 'Add a number'
  if (!/[!@#$%^&*]/.test(password))
    return 'Add a special character (!@#$%^&*)'
  if (!REGISTER_PASSWORD_PATTERN.test(password))
    return 'Password does not meet requirements'
  return null
}

export function isRegisterPasswordValid(password: string): boolean {
  return REGISTER_PASSWORD_PATTERN.test(password)
}
