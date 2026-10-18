export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string;
  passwordHash: string;
  dailyTarget: number;
  failedLoginAttempts: number;
  lockedUntil: number | null;
  createdAt: string;
  updatedAt: string;
}

export type PublicUser = Omit<User, 'passwordHash' | 'failedLoginAttempts' | 'lockedUntil'>;

export interface Item {
  id: string;
  userId: string;
  name: string;
  sku: string | null;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Production {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  worker: string;
  note: string | null;
  unitCost: number;
  unitPrice: number;
  profit: number;
  createdAt: string;
}

export interface Photo {
  id: string;
  userId: string;
  itemId: string | null;
  itemName: string;
  quantity: number;
  worker: string;
  url: string;
  path: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  replacedBy: string | null;
  revokedAt: string | null;
  expiresAt: number;
  createdAt: string;
}

export type StockStatus = 'AMAN' | 'MENIPIS' | 'HABIS';

export interface StockView extends Item {
  status: StockStatus;
}

export interface DashboardSnapshot {
  target: {
    dailyTarget: number;
    achieved: number;
    percent: number;
  };
  today: {
    output: number;
    profit: number;
    transactions: number;
  };
  stocks: StockView[];
  lowStock: StockView[];
}
