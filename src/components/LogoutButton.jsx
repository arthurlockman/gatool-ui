import { Button } from "react-bootstrap";
import { useAuth } from "../contextProviders/AuthProvider";

const LogoutButton = ({ disabled = false }) => {
  const { logout } = useAuth();

  return (
    <Button
      size="sm"
      variant="outline-danger"
      onClick={() => logout()}
      disabled={disabled}
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
