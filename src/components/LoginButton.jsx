import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "react-bootstrap";

const LoginButton = ({ size = "sm", block = false }) => {
  const { loginWithRedirect } = useAuth0();
  // @ts-ignore
  const loginButton = <Button size={size} onClick={() => loginWithRedirect()}><img src="/favicon-16x16.png" alt="gatool logo"/><div className='d-none d-md-block navBarText'>Log In</div></Button>;
  return <>
    {block ? <div className="d-grid gap-2">
      {loginButton}
    </div> :
      <>{loginButton}</>
    }</>;
};

export default LoginButton;