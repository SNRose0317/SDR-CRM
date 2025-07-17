import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const usePortalApi = () => {
  const getToken = () => localStorage.getItem('portalToken');
  
  const portalRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`/api/portal${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  };

  return { portalRequest };
};

export const usePatientProfile = () => {
  const { portalRequest } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'profile'],
    queryFn: () => portalRequest('/patient/profile'),
    enabled: !!localStorage.getItem('portalToken'),
  });
};

export const usePatientAppointments = () => {
  const { portalRequest } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'appointments'],
    queryFn: () => portalRequest('/patient/appointments'),
    enabled: !!localStorage.getItem('portalToken'),
  });
};

export const usePatientMessages = () => {
  const { portalRequest } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'messages'],
    queryFn: () => portalRequest('/patient/messages'),
    enabled: !!localStorage.getItem('portalToken'),
  });
};

export const usePatientNotifications = () => {
  const { portalRequest } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'notifications'],
    queryFn: () => portalRequest('/patient/notifications'),
    enabled: !!localStorage.getItem('portalToken'),
  });
};

export const usePatientActivities = () => {
  const { portalRequest } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'activities'],
    queryFn: () => portalRequest('/patient/activities'),
    enabled: !!localStorage.getItem('portalToken'),
  });
};

export const useSendPatientMessage = () => {
  const { portalRequest } = usePortalApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageData: {
      subject: string;
      message: string;
      healthCoachId: number;
    }) => {
      return portalRequest('/patient/messages', {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'patient', 'messages'] });
    },
  });
};