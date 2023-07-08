import { SignUp } from "@clerk/nextjs";
import React from "react";
export const runtime = "edge";

export default function Page() {
  return <SignUp />;
}
