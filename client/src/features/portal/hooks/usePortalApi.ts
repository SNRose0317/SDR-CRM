import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const usePortalApi = () => {
  const portalRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('portalToken');
    
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
  }, []);

  return { portalRequest, hasToken: !!localStorage.getItem('portalToken') };
};

export const usePatientProfile = () => {
  const { portalRequest, hasToken } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'profile'],
    queryFn: () => portalRequest('/patient/profile'),
    enabled: hasToken,
  });
};

export const usePatientAppointments = () => {
  const { portalRequest, hasToken } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'appointments'],
    queryFn: () => portalRequest('/patient/appointments'),
    enabled: hasToken,
    staleTime: 0, // Always refetch to avoid caching issues
    cacheTime: 0, // Don't cache the result
  });
};

export const usePatientMessages = () => {
  const { portalRequest, hasToken } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'messages'],
    queryFn: () => portalRequest('/patient/messages'),
    enabled: hasToken,
  });
};

export const usePatientNotifications = () => {
  const { portalRequest, hasToken } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'notifications'],
    queryFn: () => portalRequest('/patient/notifications'),
    enabled: hasToken,
  });
};

export const usePatientActivities = () => {
  const { portalRequest, hasToken } = usePortalApi();
  
  return useQuery({
    queryKey: ['portal', 'patient', 'activities'],
    queryFn: () => portalRequest('/patient/activities'),
    enabled: hasToken,
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