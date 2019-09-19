import { Document } from 'mongoose';

export interface User extends Document {
  readonly id: string;
  readonly uid: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role?: string;
  readonly verification_code?: string;
  readonly verified?: boolean;
  readonly phone?: string;
  readonly language?: string;
  readonly country?: string;
  readonly password_reset_token?: string;
  readonly password_reset_expires?: string;
  readonly login_attempts?: number;
  readonly blocked?: boolean;
  readonly block_expires?: string;
}
