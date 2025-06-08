// src/api/authService.ts
interface User {
  email: string;
  token: string;
  name?: string;
}

const MOCK_USERS = [
  {
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'Demo User',
    token: 'mock-auth-token-123'
  },
  {
    email: 'traveler@example.com',
    password: 'Travel2023!',
    name: 'Frequent Traveler',
    token: 'mock-auth-token-456'
  }
];

export const authenticateUser = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');

  return {
    email: user.email,
    token: user.token,
    name: user.name
  };
};

export const validateToken = async (token: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_USERS.some(u => u.token === token);
};

export const logoutUser = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  await new Promise(resolve => setTimeout(resolve, 200));
  const user = MOCK_USERS.find(u => u.token === token);
  
  return user ? { 
    email: user.email, 
    token: user.token,
    name: user.name 
  } : null;
};