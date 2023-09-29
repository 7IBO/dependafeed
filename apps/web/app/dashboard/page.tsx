"use client";

import {
  useUser,
  useClerk,
  useAuth,
  useSignUp,
  useSignIn,
} from "@clerk/nextjs";
import { Button } from "@ui/components/button";

const Page = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signIn } = useSignIn();
  const { signOut } = useAuth();

  console.log(user);

  const handleLogin = () => {
    signIn.authenticateWithRedirect({
      strategy: "oauth_github",
      redirectUrlComplete: "/dashboard",
      redirectUrl: "/dashboard",
    });
  };

  return (
    <div>
      <Button onClick={handleLogin}>test</Button>
      <Button onClick={() => signOut()}>sign out</Button>
    </div>
  );
};

export default Page;
