import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./LoginButton";
import { Blocks } from "react-loader-spinner";

const AuthWidget = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div><Blocks
      visible={true}
      height="38"
      width=""
      ariaLabel="blocks-loading"
      wrapperStyle={{}}
      wrapperClass="blocks-wrapper"
    /></div>;
  }

  return (
    isAuthenticated ? (
      <span>
        <div className='d-block d-xl-none' style={{
          marginRight: "5px"
        }}>
          <img src={user.picture} alt={user.name} height="31px" style={{
            borderRadius: "6px"
          }} />
        </div>
        <div className='d-none d-xl-block' style={{
          marginRight: "10px"
        }}>
          <img src={user.picture} alt={user.name} height="45px" style={{
            borderRadius: "6px"
          }} />
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