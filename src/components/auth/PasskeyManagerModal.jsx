import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Form,
  ListGroup,
  Modal,
  Spinner,
} from "react-bootstrap";
import { startRegistration } from "@simplewebauthn/browser";
import { apiBaseUrl } from "../../contextProviders/AuthClientContext";

async function authedFetch(getAccessToken, path, init = {}) {
  const token = await getAccessToken();
  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  if (init.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  return fetch(`${apiBaseUrl}${path}`, { ...init, headers });
}

const PasskeyManagerModal = ({ show, onHide, getAccessToken }) => {
  const [passkeys, setPasskeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [nickname, setNickname] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authedFetch(getAccessToken, "auth/me");
      if (!res.ok) {
        setError("Could not load passkeys.");
        return;
      }
      const data = await res.json();
      setPasskeys(data.passkeys || []);
    } catch (e) {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (show) {
      setError("");
      setInfo("");
      setNickname("");
      reload();
    }
  }, [show, reload]);

  const addPasskey = async () => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const optsRes = await authedFetch(
        getAccessToken,
        "auth/passkey/register-options",
        { method: "POST", body: JSON.stringify({}) }
      );
      if (!optsRes.ok) {
        setError("Could not start passkey registration.");
        return;
      }
      const { sessionId, options } = await optsRes.json();
      const attestation = await startRegistration({ optionsJSON: options });
      const completeRes = await authedFetch(
        getAccessToken,
        "auth/passkey/register",
        {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            nickname: nickname || null,
            attestation,
          }),
        }
      );
      if (!completeRes.ok) {
        setError("Passkey registration failed.");
        return;
      }
      setInfo("Passkey added.");
      setNickname("");
      await reload();
    } catch (e) {
      if (e?.name === "NotAllowedError" || e?.name === "AbortError") {
        setError("Passkey registration was cancelled.");
      } else {
        setError(e?.message || "Passkey registration failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  const removePasskey = async (credentialId) => {
    if (!window.confirm("Remove this passkey?")) return;
    setBusy(true);
    setError("");
    try {
      const res = await authedFetch(
        getAccessToken,
        `auth/passkey/${encodeURIComponent(credentialId)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        setError("Could not remove passkey.");
        return;
      }
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Manage passkeys</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {info && <Alert variant="success">{info}</Alert>}

        <p>
          Passkeys let you sign in with your device's biometrics or PIN — no
          email code needed. You can register one passkey per device.
        </p>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            addPasskey();
          }}
          className="mb-3"
        >
          <Form.Group className="mb-2">
            <Form.Label>Nickname (optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Leave blank to auto-detect (e.g. iCloud Keychain, 1Password)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={busy}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? <Spinner size="sm" animation="border" /> : "Add a passkey"}
          </Button>
        </Form>

        <h5>Your passkeys</h5>
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : passkeys.length === 0 ? (
          <p className="text-muted">No passkeys registered yet.</p>
        ) : (
          <ListGroup>
            {passkeys.map((pk) => (
              <ListGroup.Item
                key={pk.credentialId}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <div>
                    <strong>{pk.nickname || "Unnamed passkey"}</strong>
                  </div>
                  <small className="text-muted">
                    Added {new Date(pk.createdAt).toLocaleDateString()}
                    {pk.lastUsedAt && (
                      <> · Last used {new Date(pk.lastUsedAt).toLocaleDateString()}</>
                    )}
                  </small>
                  <div>
                    <Badge bg="secondary" style={{ fontFamily: "monospace" }}>
                      {pk.credentialId.slice(0, 12)}…
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  disabled={busy}
                  onClick={() => removePasskey(pk.credentialId)}
                >
                  Remove
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={busy}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PasskeyManagerModal;
