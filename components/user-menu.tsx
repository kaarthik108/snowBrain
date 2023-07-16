'use client'

// import {
//   createClientComponentClient,
//   type Session
// } from '@supabase/auth-helpers-nextjs'
import { SignOutButton, useAuth, useClerk } from "@clerk/nextjs";

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconExternalLink } from '@/components/ui/icons';

export interface UserMenuProps {
  user: any
}

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(' ')
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home or login page after sign out
      // You might need to update this depending on your routing setup
      router.refresh()
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-0">
            {user?.avatar_url ? (
              <Image
                height={60}
                width={60}
                className="h-6 w-6 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                src={
                  user?.avatar_url
                    ? `${user.avatar_url}`
                    : ''
                }
                alt={user.name ?? 'Avatar'}
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                {user?.name
                  ? getUserInitials(user?.name)
                  : null}
              </div>
            )}
            <span className="ml-2">{user?.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">
              {user?.name}
            </div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://twitter.com/kaarthikcodes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between text-xs"
            >
              Follow on Twitter
              <IconExternalLink className="ml-auto h-3 w-3" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href="https://www.linkedin.com/in/kaarthik-andavar-b32a27143/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between text-xs"
            >
              Follow on LinkedIn
              <IconExternalLink className="ml-auto h-3 w-3" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-xs">
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
