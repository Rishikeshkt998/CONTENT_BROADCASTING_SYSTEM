export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'principal' | 'teacher';
  createdAt: string;
}
