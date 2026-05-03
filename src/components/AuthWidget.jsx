import React, { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Blocks } from "react-loader-spinner";
import { useAuth, initialsAvatar } from "../contextProviders/AuthProvider";
import LoginButton from "./LoginButton";
import { UseAuthClient } from "../contextProviders/AuthClientContext";

// react-bootstrap custom toggle that renders any node and forwards the
// click handler to it. Used so the avatar image itself acts as the dropdown
// trigger without an extra button frame.
const AvatarToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    role="button"
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: "pointer" }}
  >
    {children}
  </span>
));

const StatusPill = ({ height, padding, fontSize, color, label }) => (
  <div
    style={{
      height,
      borderRadius: "6px",
      backgroundColor: color,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding,
      fontSize,
      fontWeight: "bold",
    }}
  >
    {label}
  </div>
);

const AuthenticatedAvatar = ({
  user,
  height,
  openPasskeyModal,
  logout,
}) => (
  <Dropdown align="end">
    <Dropdown.Toggle as={AvatarToggle}>
      <img
        src={user.picture}
        alt={user.name}
        height={`${height}px`}
        style={{ borderRadius: "6px" }}
        onError={(e) => {
          // Gravatar failed at render time — fall back to locally-rendered
          // initials avatar so we always show something.
          if (user?.email && !e.currentTarget.dataset.fallback) {
            e.currentTarget.dataset.fallback = "1";
            e.currentTarget.src = initialsAvatar(user.email);
          }
        }}
      />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Header>{user.email || user.name}</Dropdown.Header>
      <Dropdown.Item onClick={openPasskeyModal}>Manage passkeys</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item onClick={() => logout()}>Log out</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

const AuthWidget = ({
  screenMode = false,
  screenModeStatus = null,
  syncEvent = false,
}) => {
  const { user, isAuthenticated, isLoading, openPasskeyModal, logout } = useAuth();
  const [, operationsInProgress] = UseAuthClient();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setShowSpinner(operationsInProgress || isLoading);
  }, [operationsInProgress, isLoading]);

  useEffect(() => {
    if (screenMode) {
      console.log("AuthWidget: screenModeStatus changed to", screenModeStatus);
    }
  }, [screenMode, screenModeStatus]);

  const renderInner = (height, padding, fontSize) => {
    if (showSpinner) {
      return (
        <Blocks
          visible={true}
          height={`${height}`}
          width=""
          ariaLabel="blocks-loading"
        />
      );
    }
    if (screenMode) {
      return (
        <StatusPill
          height={`${height}px`}
          padding={padding}
          fontSize={fontSize}
          color={
            screenModeStatus === true
              ? "#28a745"
              : screenModeStatus === false
              ? "#dc3545"
              : "#007bff"
          }
          label={screenModeStatus === false ? "ENABLE SYNC" : "SCREEN MODE"}
        />
      );
    }
    if (syncEvent) {
      return (
        <StatusPill
          height={`${height}px`}
          padding={padding}
          fontSize={fontSize}
          color="#28a745"
          label="SYNCING ON"
        />
      );
    }
    return (
      <AuthenticatedAvatar
        user={user}
        height={height}
        openPasskeyModal={openPasskeyModal}
        logout={logout}
      />
    );
  };

  if (isAuthenticated) {
    return (
      <span>
        <div className="d-block d-xl-none" style={{ marginRight: "5px" }}>
          {renderInner(31, "0 8px", "10px")}
        </div>
        <div className="d-none d-xl-block" style={{ marginRight: "10px" }}>
          {renderInner(45, "0 12px", "14px")}
        </div>
      </span>
    );
  }

  return (
    <span>
      <div className="d-block d-xl-none" style={{ marginRight: "5px" }}>
        {showSpinner ? (
          <Blocks visible={true} height="31" width="" ariaLabel="blocks-loading" />
        ) : (
          <LoginButton />
        )}
      </div>
      <div className="d-none d-xl-block" style={{ marginRight: "10px" }}>
        {showSpinner ? (
          <Blocks visible={true} height="45" width="" ariaLabel="blocks-loading" />
        ) : (
          <LoginButton />
        )}
      </div>
    </span>
  );
};

export default AuthWidget;
