import { useSupabase } from "@composables/useSupabase";
import { Session } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { readonly, shallowRef } from "vue";

export const useSession = defineStore("session", () => {
  const supabase = useSupabase();
  const session = shallowRef<Session | null>(null);

  async function refreshSession() {
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    session.value = s;
  }

  async function signUp(email: string, password: string) {
    await supabase.auth.signUp({ email, password });
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function signInWithPassword(email: string, password: string) {
    await supabase.auth.signInWithPassword({ email, password });
  }

  function signOut() {
    supabase.auth.signOut();
  }

  async function deleteAccount() {
    await supabase.rpc("delete_user");
  }

  supabase.auth.onAuthStateChange((event, s) => {
    session.value = s;
  });

  return {
    session: readonly(session),
    refreshSession,
    signUp,
    signOut,
    signInWithPassword,
    signInWithGoogle,
    deleteAccount,
  };
});
