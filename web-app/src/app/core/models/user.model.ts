export interface Location {
  type: string;
  coordinates: number[]; // [longitude, latitude]
}

export interface Address {
  label: string;
  location: Location;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  addresses: Address[];
  role: 'consumer' | 'restaurant';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: 'consumer' | 'restaurant';
  iat?: number;
  exp?: number;
}
