import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="max-w-sm text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button nativeButton={false} render={<Link href="/" />}>Back to Dashboard</Button>
    </div>
  );
}
