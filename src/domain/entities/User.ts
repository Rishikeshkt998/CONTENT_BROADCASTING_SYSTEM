export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'principal' | 'teacher' | 'student';
  created_at: Date;
  updated_at: Date;
}
