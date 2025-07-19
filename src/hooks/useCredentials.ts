import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Credential {
  id: string;
  name: string;
  type: 'postgresql' | 'redshift' | 'oracle' | 'mysql';
  host: string;
  port: number;
  database_name: string;
  username: string;
  ssl_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCredentialData {
  name: string;
  type: 'postgresql' | 'redshift' | 'oracle' | 'mysql';
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_enabled: boolean;
}

export interface TestConnectionData {
  type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_enabled: boolean;
}

export const useCredentials = () => {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('manage-credentials', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching credentials:', error);
        throw new Error('Failed to fetch credentials');
      }

      return data.credentials as Credential[];
    }
  });
};

export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentialData: CreateCredentialData) => {
      const { data, error } = await supabase.functions.invoke('manage-credentials', {
        method: 'POST',
        body: credentialData
      });

      if (error) {
        console.error('Error creating credential:', error);
        throw new Error(error.message || 'Failed to create credential');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      toast({
        title: "Success",
        description: "Credential created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create credential",
        variant: "destructive",
      });
    }
  });
};

export const useTestConnection = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (connectionData: TestConnectionData) => {
      const { data, error } = await supabase.functions.invoke('manage-credentials', {
        method: 'POST',
        body: connectionData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error testing connection:', error);
        throw new Error(error.message || 'Connection test failed');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to test connection",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteCredential = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentialId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-credentials', {
        method: 'DELETE',
        body: null,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error deleting credential:', error);
        throw new Error(error.message || 'Failed to delete credential');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      toast({
        title: "Success",
        description: "Credential deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete credential",
        variant: "destructive",
      });
    }
  });
};