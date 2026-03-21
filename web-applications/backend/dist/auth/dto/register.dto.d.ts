export declare const REGISTER_PASSWORD_PATTERN: RegExp;
export declare const REGISTER_PASSWORD_MESSAGE = "Password must be 8\u201372 characters and include uppercase, lowercase, a number, and a special character (!@#$%^&*)";
export declare class RegisterDto {
    email: string;
    displayName?: string;
    password: string;
}
