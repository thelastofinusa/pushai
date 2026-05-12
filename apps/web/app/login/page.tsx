"use client";

import { SignIn, useAuth, useSession } from "@clerk/nextjs";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const { isLoaded, userId } = useAuth();
  const { session } = useSession();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  useEffect(() => {
    const handleCallback = async () => {
      if (isLoaded && userId && session && callback) {
        try {
          console.log("Session loaded, getting token...");
          const token = await session.getToken();

          if (token) {
            const redirectUrl = new URL(callback);
            redirectUrl.searchParams.set("token", token);

            console.log("Redirecting to CLI:", redirectUrl.toString());
            window.location.href = redirectUrl.toString();
          }
        } catch (error) {
          console.error("Failed to redirect to CLI:", error);
        }
      }
    };

    handleCallback();
  }, [isLoaded, userId, session, callback]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {userId && callback ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              Authenticating CLI...
            </h2>
            <p className="text-gray-600">
              Please wait while we connect your account to the terminal.
            </p>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : (
          <SignIn
            routing="hash"
            signUpUrl="/sign-up"
            fallbackRedirectUrl={
              callback
                ? `/login?callback=${encodeURIComponent(callback)}`
                : "/dashboard"
            }
            forceRedirectUrl={
              callback
                ? `/login?callback=${encodeURIComponent(callback)}`
                : "/dashboard"
            }
          />
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
