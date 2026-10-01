"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyPortalLinkButton({ accessToken }: { accessToken: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/staff/${accessToken}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {copied ? "Скопировано" : "Ссылка мастеру"}
    </Button>
  );
}
