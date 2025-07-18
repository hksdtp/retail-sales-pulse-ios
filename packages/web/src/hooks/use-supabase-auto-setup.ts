import { useState, useEffect } from 'react';
import { SupabaseService } from '@/services/SupabaseService';

export const useSupabaseAutoSetup = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setupSupabase();
  }, []);

  const setupSupabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if already configured
      if (SupabaseService.isConfigured()) {
        const service = SupabaseService.initializeFromLocalStorage();
        if (service) {
          setIsConfigured(true);
          
          return;
        }
      }

      // Try to initialize with environment variables
      const envUrl = import.meta.env.VITE_SUPABASE_URL;
      const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (envUrl && envAnonKey && 
          envUrl !== 'https://your-project.supabase.co' && 
          envAnonKey !== 'your-anon-key-here') {

        const supabaseService = SupabaseService.initializeApp({
          url: envUrl,
          anonKey: envAnonKey
        });

        if (supabaseService) {
          const isDev = SupabaseService.isDevelopmentMode();
          const isLocal = SupabaseService.isUsingLocalSupabase();

          if (isDev) {
            
          }
          setIsConfigured(true);

          // Save to localStorage for next time
          localStorage.setItem('supabaseConfig', JSON.stringify({
            url: envUrl,
            anonKey: envAnonKey
          }));
          localStorage.setItem('supabaseConfigured', 'true');
        } else {
          throw new Error('Failed to initialize Supabase');
        }
      } else {
        console.log('⚠️ No Supabase environment config found');
        setError('Supabase configuration not found. Please set up your environment variables.');
      }
    } catch (err) {
      console.error('❌ Supabase auto-setup failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const manualSetup = async (url: string, anonKey: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabaseService = SupabaseService.initializeApp({ url, anonKey });
      
      if (supabaseService) {
        setIsConfigured(true);
        
        return true;
      } else {
        throw new Error('Failed to initialize Supabase');
      }
    } catch (err) {
      console.error('❌ Manual Supabase setup failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    const service = SupabaseService.getInstance();
    return await service.testConnection();
  };

  return {
    isConfigured,
    isLoading,
    error,
    setupSupabase,
    manualSetup,
    testConnection
  };
};
