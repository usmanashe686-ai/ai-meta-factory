import { nanoid } from 'nanoid';

export interface IUser {
  id: string;
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
}

// In-memory store – replace with PostgreSQL + Prisma later
const users: IUser[] = [];

export const UserModel = {
  findByEmail: (email: string): IUser | undefined => {
    return users.find(u => u.email === email);
  },

  findById: (id: string): IUser | undefined => {
    return users.find(u => u.id === id);
  },

  create: (userData: Omit<IUser, 'id' | 'createdAt'>): IUser => {
    const newUser = {
      id: nanoid(),
      createdAt: new Date(),
      ...userData,
    };
    users.push(newUser);
    return newUser;
  },
};
