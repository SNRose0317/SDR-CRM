import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PortalUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  contactId: number;
  contact: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: PortalUser;
  sessionToken: string;
}

export function usePortalAuth() {
  const queryClient = useQueryClient();

  const getStoredToken = () => localStorage.getItem('portalToken');
  const getStoredUser = () => {
    const user = localStorage.getItem('portalUser');
    return user ? JSON.parse(user) : null;
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ['portal-auth'],
    queryFn: () => getStoredUser(),
    enabled: !!getStoredToken(),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await fetch('/api/portal/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('portalToken', data.sessionToken);
      localStorage.setItem('portalUser', JSON.stringify(data.user));
      queryClient.setQueryData(['portal-auth'], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getStoredToken();
      if (token) {
        await fetch('/api/portal/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    },
    onSuccess: () => {
      localStorage.removeItem('portalToken');
      localStorage.removeItem('portalUser');
      queryClient.setQueryData(['portal-auth'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}