import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { startAuthentication } from "@simplewebauthn/browser";
import { apiBaseUrl } from "../../contextProviders/AuthClientContext";
import usePasskeyAutofill from "./usePasskeyAutofill";

const STEP_EMAIL = "email";
const STEP_CODE = "code";

async function postJson(path, body) {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res;
}

const LoginModal = ({ show, onHide, defaultEmail = "", onAuthenticated }) => {
  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const codeInputRef = useRef(null);
  // Latest values referenced by the long-lived autofill ceremony.
  const onAuthenticatedRef = useRef(onAuthenticated);
  const onHideRef = useRef(onHide);
  useEffect(() => {
    onAuthenticatedRef.current = onAuthenticated;
    onHideRef.current = onHide;
  });

  useEffect(() => {
    if (show) {
      setEmail(defaultEmail || "");
      setCode("");
      setError("");
      setInfo("");
      setStep(STEP_EMAIL);
      setBusy(false);
    }
  }, [show, defaultEmail]);

  // Conditional UI / passkey autofill — kicks off a background WebAuthn
  // ceremony when the email step is visible so the browser can offer saved
  // passkeys via the autofill dropdown.
  usePasskeyAutofill({
    enabled: show && step === STEP_EMAIL,
    onAuthenticatedRef,
    onHideRef,
  });

  useEffect(() => {
    if (step === STEP_CODE && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  const close = () => {
    if (busy) return;
    if (step === STEP_CODE) {
      const ok = window.confirm(
        "Cancel sign-in? You'll need to request a new code if you start over."
      );
      if (!ok) return;
    }
    onHide();
  };

  const requestOtp = async (e) => {
    e?.preventDefault?.();
    setError("");
    setInfo("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await postJson("auth/otp/request", { email });
      if (res.status !== 204) {
        setError("Could not send code. Please try again in a moment.");
        return;
      }
      setStep(STEP_CODE);
      setInfo(`We emailed a 6-digit code to ${email}.`);
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      const res = await postJson("auth/otp/verify", {
        email,
        code: code.trim(),
      });
      if (!res.ok) {
        setError("That code is invalid or expired. Try again or request a new one.");
        return;
      }
      const data = await res.json();
      await onAuthenticated(data);
      onHide();
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const usePasskey = async () => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const optsRes = await postJson("auth/passkey/auth-options", {
        email: email && email.includes("@") ? email : null,
      });
      if (!optsRes.ok) {
        setError("Could not start passkey sign-in.");
        return;
      }
      const { sessionId, options } = await optsRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      const completeRes = await postJson("auth/passkey/authenticate", {
        sessionId,
        assertion,
      });
      if (!completeRes.ok) {
        setError("Passkey sign-in failed.");
        return;
      }
      const data = await completeRes.json();
      await onAuthenticated(data);
      onHide();
    } catch (e) {
      if (e?.name === "NotAllowedError" || e?.name === "AbortError") {
        setError("Passkey sign-in was cancelled.");
      } else {
        setError(e?.message || "Passkey sign-in failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={close}
      centered
      backdrop={busy || step === STEP_CODE ? "static" : true}
      keyboard={!busy && step !== STEP_CODE}
    >
      <Modal.Header closeButton={!busy}>
        <Modal.Title>Sign in to gatool</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {info && <Alert variant="info">{info}</Alert>}

        {step === STEP_EMAIL && (
          <Form onSubmit={requestOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                autoComplete="username webauthn"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                autoFocus
              />
              <Form.Text>
                We'll email you a 6-digit code. No password required.
              </Form.Text>
            </Form.Group>
            <div className="d-grid gap-2">
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? <Spinner size="sm" animation="border" /> : "Email me a code"}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                disabled={busy}
                onClick={usePasskey}
              >
                Use a passkey instead
              </Button>
            </div>
          </Form>
        )}

        {step === STEP_CODE && (
          <Form onSubmit={verifyOtp}>
            <Form.Group className="mb-3">
              <Form.Label>6-digit code</Form.Label>
              <Form.Control
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                disabled={busy}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? <Spinner size="sm" animation="border" /> : "Sign in"}
              </Button>
              <Button
                type="button"
                variant="link"
                disabled={busy}
                onClick={() => {
                  setStep(STEP_EMAIL);
                  setCode("");
                  setError("");
                  setInfo("");
                }}
              >
                Use a different email
              </Button>
              <Button
                type="button"
                variant="link"
                disabled={busy}
                onClick={requestOtp}
              >
                Resend code
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;
