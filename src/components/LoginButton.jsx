import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";

const LoginButton = ({ size = "sm", block = false }) => {
  const { loginWithRedirect } = useAuth0();
  // @ts-ignore
  const loginButton = <Button size={size} onClick={() => loginWithRedirect()}>Log In</Button>;
  return <>
    {block ? <div className="d-grid gap-2">
      {loginButton}
    </div> :
      <>{loginButton}</>
    }</>;
};

export default LoginButton;