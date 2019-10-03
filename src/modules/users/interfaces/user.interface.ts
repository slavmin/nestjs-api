import { Document } from 'mongoose';

export interface User extends Document {
  readonly id: string;
  readonly uuid: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role?: string;
  readonly status?: string;
  readonly verification_code?: string;
  readonly email_verified?: boolean;
  readonly phone?: string;
  readonly phone_verified?: boolean;
  readonly language?: string;
  readonly country?: string;
  readonly password_reset_token?: string;
  readonly password_reset_expires?: string;
  readonly login_attempts?: number;
  readonly blocked?: boolean;
  readonly block_expires?: string;
  readonly banned?: boolean;
  readonly ban_expires?: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}
