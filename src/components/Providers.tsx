"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

const AuthProvider = ({ children }: any) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
