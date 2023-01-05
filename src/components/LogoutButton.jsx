import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";

const LogoutButton = ({disabled = false}) => {
  const { logout } = useAuth0();

  return (
    <Button size="md" variant="outline-danger" onClick={() => logout({ returnTo: window.location.origin })} disabled={disabled}>
      Log Out
    </Button>
  );
};

export default LogoutButton;