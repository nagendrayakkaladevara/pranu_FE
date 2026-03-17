import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

interface UserMenuProps {
  /** Only show on mobile (md:hidden). Pass false to always show. */
  mobileOnly?: boolean;
}

export function UserMenu({ mobileOnly = true }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  if (!user) return null;

  const canChangePassword = user.role === "STUDENT" || user.role === "LECTURER";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={mobileOnly ? "size-8 md:hidden" : "size-8"}
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-xs font-display font-bold text-primary">
                {user.name.charAt(0)}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="font-normal text-muted-foreground text-xs py-1">
            Theme
          </DropdownMenuLabel>
          <div className="px-2 pb-2 pt-0">
            <ThemeToggle fullWidth />
          </div>
          <DropdownMenuSeparator />
          {canChangePassword ? (
            <DropdownMenuItem
              onClick={() => setChangePasswordOpen(true)}
              className="cursor-pointer"
            >
              <KeyRound className="size-4" />
              <span>Change password</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled
              className="cursor-default data-[disabled]:opacity-100"
            >
              <KeyRound className="size-4" />
              <span>Change password</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">
                Use profile
              </Badge>
            </DropdownMenuItem>
          )}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </>
  );
}
