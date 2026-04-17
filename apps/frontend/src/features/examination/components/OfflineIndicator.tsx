import { CloudOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useOnlineStatus } from "../hooks/use-online-status";

/**
 * Small badge shown when the browser is offline. While offline, examination
 * mutations pause via TanStack Query's `networkMode: "offlineFirst"` and
 * auto-resume when the connection returns.
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <Badge variant="outline" className="gap-1.5 border-amber-400 text-amber-700">
      <CloudOff className="h-3 w-3" />
      Offline — Änderungen werden nach Verbindungsaufbau gespeichert
    </Badge>
  );
}
