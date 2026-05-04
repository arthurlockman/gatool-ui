import { useEffect } from "react";
import {
  startAuthentication,
  browserSupportsWebAuthnAutofill,
  WebAuthnAbortService,
} from "@simplewebauthn/browser";
import { apiBaseUrl } from "../../contextProviders/AuthClientContext";

// Conditional UI / passkey autofill. When `enabled` is true AND the browser
// supports it, kick off a background passkey ceremony so the browser can
// surface saved passkeys in the email field's autofill dropdown. If the user
// picks one, authenticate immediately via the provided callbacks.
export default function usePasskeyAutofill({
  enabled,
  onAuthenticatedRef,
  onHideRef,
}) {
  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const supported = await browserSupportsWebAuthnAutofill();
        if (!supported || cancelled) return;

        const optsRes = await fetch(`${apiBaseUrl}auth/passkey/auth-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: null }),
        });
        if (!optsRes.ok || cancelled) return;
        const { sessionId, options } = await optsRes.json();

        const assertion = await startAuthentication({
          optionsJSON: options,
          useBrowserAutofill: true,
        });
        if (cancelled) return;

        const completeRes = await fetch(
          `${apiBaseUrl}auth/passkey/authenticate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, assertion }),
          }
        );
        if (!completeRes.ok || cancelled) return;
        const data = await completeRes.json();
        await onAuthenticatedRef.current(data);
        onHideRef.current();
      } catch (e) {
        // Autofill ceremonies frequently abort (modal closed, user typed
        // their email, switched to OTP, etc) — that's normal, swallow.
      }
    })();

    return () => {
      cancelled = true;
      // Cancel any in-flight WebAuthn ceremony so a fresh one can start
      // (e.g. when the user clicks "Use a passkey instead").
      try {
        WebAuthnAbortService.cancelCeremony();
      } catch (e) {
        /* ignore */
      }
    };
  }, [enabled, onAuthenticatedRef, onHideRef]);
}
