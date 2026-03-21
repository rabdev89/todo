"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = exports.REGISTER_PASSWORD_MESSAGE = exports.REGISTER_PASSWORD_PATTERN = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function trimEmail({ value }) {
    return typeof value === 'string' ? value.trim() : value;
}
function trimOptionalDisplayName({ value }) {
    if (typeof value !== 'string')
        return undefined;
    const t = value.trim();
    return t.length > 0 ? t : undefined;
}
exports.REGISTER_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,72}$/;
exports.REGISTER_PASSWORD_MESSAGE = 'Password must be 8–72 characters and include uppercase, lowercase, a number, and a special character (!@#$%^&*)';
class RegisterDto {
    email;
    displayName;
    password;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_transformer_1.Transform)(trimEmail),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(trimOptionalDisplayName),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RegisterDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(72),
    (0, class_validator_1.Matches)(exports.REGISTER_PASSWORD_PATTERN, { message: exports.REGISTER_PASSWORD_MESSAGE }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
//# sourceMappingURL=register.dto.js.map