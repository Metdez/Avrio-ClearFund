export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Deal Team" | "Read-Only";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}
