export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
