import type { SupabaseClient } from '@supabase/supabase-js';

export class Supabase {
  private static instance: Supabase;
  private client: SupabaseClient;

  private constructor(client: SupabaseClient) {
    this.client = client;
  }

  public static getInstance(client?: SupabaseClient): Supabase {
    if (!Supabase.instance) {
      if (!client) {
        throw new Error(
          'Supabase client has not been initialized. Pass a client to `Supabase.getInstance(...)` first.',
        );
      }
      Supabase.instance = new Supabase(client);
    }
    return Supabase.instance;
  }

  public getClient(): SupabaseClient {
    return this.client;
  }
}

export default Supabase;
