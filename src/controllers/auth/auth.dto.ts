export abstract class BaseAuthDto {
  email: string;
  password: string;
  deviceModel?: string;
}

export class LoginAuthDto extends BaseAuthDto {}

export class RegisterAuthDto extends BaseAuthDto {
  firstName: string;
}
