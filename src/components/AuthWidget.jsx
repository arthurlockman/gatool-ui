import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import { Blocks } from "react-loader-spinner";
import { UseAuthClient } from "../contextProviders/AuthClientContext";

const AuthWidget = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [, operationsInProgress] = UseAuthClient();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setShowSpinner(operationsInProgress || isLoading);
  }, [operationsInProgress, isLoading])

  return (
    isAuthenticated ? (
      <span>
        <div className='d-block d-xl-none' style={{
          marginRight: "5px"
        }}>
          {showSpinner ? <Blocks
            visible={true}
            height="38"
            width=""
            ariaLabel="blocks-loading"
          /> : <img src={user.picture} alt={user.name} height="31px" style={{
            borderRadius: "6px"
          }} />}
        </div>
        <div className='d-none d-xl-block' style={{
          marginRight: "10px"
        }}>
          {showSpinner ? <Blocks
            visible={true}
            height="45"
            width=""
            ariaLabel="blocks-loading"
          /> : <img src={user.picture} alt={user.name} height="45px" style={{
            borderRadius: "6px"
          }} />}
        </div>
      </span>
    ) : (
      <span>
        <LoginButton />
      </span>
    )
  );
};

export default AuthWidget;