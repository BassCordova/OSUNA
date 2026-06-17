import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Avatar({ user, size = 28, className }: { user?: User; size?: number; className?: string }) {
  if (!user) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400", className)}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title="Sin asignar"
      >
        ?
      </div>
    );
  }
  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-medium text-white shrink-0", className)}
      style={{ width: size, height: size, backgroundColor: user.avatarColor, fontSize: size * 0.38 }}
      title={user.name}
    >
      {user.initials}
    </div>
  );
}
