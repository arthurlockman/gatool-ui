import { Button } from "react-bootstrap";
import { useAuth } from "../contextProviders/AuthProvider";

const LoginButton = ({ size = "sm", block = false, disabled = false }) => {
  const { openLoginModal } = useAuth();
  // @ts-ignore
  const loginButton = (
    <Button size={size} disabled={disabled} onClick={() => openLoginModal()}>
      <img src="/favicon-16x16.png" alt="gatool logo" />
      <div className="d-none d-md-block navBarText">Log In</div>
    </Button>
  );
  return (
    <>
      {block ? <div className="d-grid gap-2">{loginButton}</div> : <>{loginButton}</>}
    </>
  );
};

export default LoginButton;
