"use client";

import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  if (!isLoaded)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Account Dashboard
          </CardTitle>
          <UserButton afterSwitchSessionUrl="/dashboard" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-center py-4">
            <p className="text-sm font-medium text-muted-foreground">
              Logged in as
            </p>
            <p className="text-lg font-semibold">
              {user.fullName || user.username}
            </p>
            <p className="text-sm text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <div className="pt-4 border-t flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Go Home
            </Button>
            <SignOutButton>
              <Button variant="destructive" className="w-full">
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
