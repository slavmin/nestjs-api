export interface VerifyDto {
  verification_code: string;
  verified: boolean;
}

export interface SendMailDto {
  subject: string;
  template: string;
  link?: string;
  email: string;
  username: string;
  token?: string;
}

export interface JwtPayload {
  sub: string;
  jti: string;
  name?: string;
  scope: string;
}
