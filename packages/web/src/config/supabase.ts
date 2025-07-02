import { SupabaseService } from '@/services/SupabaseService';

// ⚠️ DEPRECATED: This file creates multiple Supabase clients
// Use SupabaseService.getInstance() instead for centralized client management

console.warn('⚠️ [DEPRECATED] supabase.ts: Use SupabaseService.getInstance() instead');

// Get the centralized Supabase service instance
export const supabaseService = SupabaseService.getInstance();

// Export the client from the service (will be null if not initialized)
export const supabase = supabaseService.getClient();

// Re-export the service as default to maintain compatibility
export default supabaseService;
