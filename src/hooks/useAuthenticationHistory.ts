import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuthenticationRecord {
  id: string;
  created_at: string;
  updated_at: string;
  inventory_item_id: string | null;
  brand: string;
  item_name: string;
  size: string | null;
  ai_score: number | null;
  ai_verdict: string | null;
  ai_reasoning: Record<string, unknown> | null;
  ai_analyzed_details: Record<string, unknown> | null;
  reference_sources: Record<string, unknown>[] | null;
  manual_verdict: string | null;
  manual_notes: string | null;
  manually_verified_at: string | null;
  verified_by: string | null;
  verification_source: string | null;
  image_urls: string[] | null;
}

interface CreateAuthenticationInput {
  brand: string;
  item_name: string;
  size?: string;
  inventory_item_id?: string;
  ai_score?: number;
  ai_verdict?: string;
  ai_reasoning?: Record<string, unknown>;
  ai_analyzed_details?: Record<string, unknown>;
  reference_sources?: Record<string, unknown>[];
  image_urls?: string[];
}

interface UpdateManualVerificationInput {
  id: string;
  manual_verdict: string;
  manual_notes?: string;
  verified_by?: string;
  verification_source?: string;
}

export function useAuthenticationHistory(inventoryItemId?: string) {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ['authentication-history', inventoryItemId],
    queryFn: async () => {
      let query = supabase
        .from('item_authentication_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (inventoryItemId) {
        query = query.eq('inventory_item_id', inventoryItemId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AuthenticationRecord[];
    },
  });

  const createRecord = useMutation({
    mutationFn: async (input: CreateAuthenticationInput) => {
      const { data, error } = await supabase
        .from('item_authentication_history')
        .insert([{
          brand: input.brand,
          item_name: input.item_name,
          size: input.size || null,
          inventory_item_id: input.inventory_item_id || null,
          ai_score: input.ai_score || null,
          ai_verdict: input.ai_verdict || null,
          ai_reasoning: input.ai_reasoning as never || null,
          ai_analyzed_details: input.ai_analyzed_details as never || null,
          reference_sources: input.reference_sources as never || null,
          image_urls: input.image_urls || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authentication-history'] });
    },
  });

  const updateManualVerification = useMutation({
    mutationFn: async (input: UpdateManualVerificationInput) => {
      const { data, error } = await supabase
        .from('item_authentication_history')
        .update({
          manual_verdict: input.manual_verdict,
          manual_notes: input.manual_notes || null,
          verified_by: input.verified_by || null,
          verification_source: input.verification_source || null,
          manually_verified_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authentication-history'] });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('item_authentication_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authentication-history'] });
    },
  });

  return {
    records,
    isLoading,
    error,
    createRecord,
    updateManualVerification,
    deleteRecord,
  };
}
