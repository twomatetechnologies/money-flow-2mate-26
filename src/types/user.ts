
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin: Date | null;
  has2FAEnabled: boolean;
  settings: {
    darkMode: boolean;
    notifications: boolean;
    [key: string]: any; // Allow for additional settings
  };
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role?: string;
  has2FAEnabled?: boolean;
  settings?: {
    darkMode?: boolean;
    notifications?: boolean;
    [key: string]: any; // Allow for additional settings
  };
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  role?: string;
  has2FAEnabled?: boolean;
  settings?: {
    darkMode?: boolean;
    notifications?: boolean;
    [key: string]: any;
  };
}
