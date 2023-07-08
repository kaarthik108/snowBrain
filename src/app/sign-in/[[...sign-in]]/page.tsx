import { SignIn } from "@clerk/nextjs";

export const runtime = "edge";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn />;
    </div>
  );
}
