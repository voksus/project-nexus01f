export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}
