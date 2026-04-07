import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import { Blocks } from "react-loader-spinner";
import { UseAuthClient } from "../contextProviders/AuthClientContext";

const AuthWidget = ({ screenMode = false, screenModeStatus = null, syncEvent = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [, operationsInProgress] = UseAuthClient();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setShowSpinner(operationsInProgress || isLoading);
  }, [operationsInProgress, isLoading]);

  // Debug logging for screen mode status
  useEffect(() => {
    if (screenMode) {
      console.log("AuthWidget: screenModeStatus changed to", screenModeStatus);
    }
  }, [screenMode, screenModeStatus]);

  return (
    isAuthenticated ? (
      <span>
        <div className='d-block d-xl-none' style={{
          marginRight: "5px"
        }}>
          {showSpinner ? <Blocks
            visible={true}
            height="31"
            width=""
            ariaLabel="blocks-loading"
          /> : screenMode ? (
            <div style={{
              height: "31px",
              borderRadius: "6px",
              backgroundColor: screenModeStatus === true ? "#28a745" : (screenModeStatus === false ? "#dc3545" : "#007bff"),
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              fontSize: "10px",
              fontWeight: "bold"
            }}>
              {(screenModeStatus === false) ? "ENABLE SYNC" : "SCREEN MODE"}
            </div>
          ) : syncEvent ? (
            <div style={{
              height: "31px",
              borderRadius: "6px",
              backgroundColor: "#28a745",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 8px",
              fontSize: "10px",
              fontWeight: "bold"
            }}>
              SYNCING ON
            </div>
          ) : (
            <img src={user.picture} alt={user.name} height="31px" style={{
              borderRadius: "6px"
            }} />
          )}
        </div>
        <div className='d-none d-xl-block' style={{
          marginRight: "10px"
        }}>
          {showSpinner ? <Blocks
            visible={true}
            height="45"
            width=""
            ariaLabel="blocks-loading"
          /> : screenMode ? (
            <div style={{
              height: "45px",
              borderRadius: "6px",
              backgroundColor: screenModeStatus === true ? "#28a745" : (screenModeStatus === false ? "#dc3545" : "#007bff"),
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 12px",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              {(screenModeStatus === false) ? "ENABLE SYNC" : "SCREEN MODE"}
            </div>
          ) : syncEvent ? (
            <div style={{
              height: "45px",
              borderRadius: "6px",
              backgroundColor: "#28a745",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 12px",
              fontSize: "14px",
              fontWeight: "bold"
            }}>
              SYNCING ON
            </div>
          ) : (
            <img src={user.picture} alt={user.name} height="45px" style={{
              borderRadius: "6px"
            }} />
          )}
        </div>
      </span>
    ) : (
      <span>
        <div className='d-block d-xl-none' style={{
          marginRight: "5px"
        }}>
          {showSpinner ? <Blocks
            visible={true}
            height="31"
            width=""
            ariaLabel="blocks-loading"
          /> : <LoginButton />}
        </div>
        <div className='d-none d-xl-block' style={{
          marginRight: "10px"
        }}>
          {showSpinner ? <Blocks
            visible={true}
            height="45"
            width=""
            ariaLabel="blocks-loading"
          /> : <LoginButton />}
        </div>
      </span>
    )
  );
};

export default AuthWidget;