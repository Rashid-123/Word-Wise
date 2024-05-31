import { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [isAdmin, setIsAdmin] = useState(
    JSON.parse(localStorage.getItem("isAdmin"))
  );

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
    localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
  }, [currentUser, isAdmin]);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, isAdmin, setIsAdmin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
