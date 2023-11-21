import type { Unsubscribe } from "firebase/auth";
import { readable } from "svelte/store";

export type AuthStatus = true | false | undefined;

export interface AuthState {
  isAuthed: AuthStatus;
  isAdmin: AuthStatus;
}

export const authState = readable<AuthState>(
  {
    isAuthed: undefined,
    isAdmin: undefined,
  },
  (setter, updater) => {
    let unsub: Unsubscribe | undefined;

    (async () => {
      const auth = await (
        await import("#firebase")
      ).Firebase.getInstance()?.auth();

      unsub = auth?.onAuthStateChanged((user) => {
        if (user) {
          updater((authState) => {
            authState.isAuthed = true;
            return authState;
          });
          user.getIdTokenResult(true).then(({ claims: { admin } }) => {
            updater((authState) => {
              authState.isAdmin = Boolean(admin);
              return authState;
            });
          });
        } else {
          setter({
            isAuthed: false,
            isAdmin: false,
          });
        }
      });
    })().catch(() => {
      setter({
        isAuthed: false,
        isAdmin: false,
      });
    });

    return () => {
      if (unsub) {
        // Hopefully the listener gets scaffolded before this
        unsub();
      }
    };
  }
);

export default authState;
