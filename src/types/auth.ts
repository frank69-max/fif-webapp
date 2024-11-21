export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  profileImage?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export interface Appraisal {
  id: number;
  content: string;
  rating?: number;
  supervisorRemarks?: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}