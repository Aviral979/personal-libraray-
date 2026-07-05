"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function ModeratorLogin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        id,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Access Denied");
      } else {
        toast.success("Moderator access granted");
        router.push("/moderator");
      }
    } catch (error) {
      toast.error("System error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/50">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-mono text-red-500">RESTRICTED ACCESS</CardTitle>
          <CardDescription className="text-zinc-400">Moderator clearance required</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-zinc-300">Clearance ID</Label>
              <Input
                id="id"
                type="password"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Passcode</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white font-mono"
                required
              />
            </div>
            <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Authorize"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
