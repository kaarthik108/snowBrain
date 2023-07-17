import Link from 'next/link'
import * as React from 'react'

import { clearChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { Sidebar } from '@/components/sidebar'
import { SidebarFooter } from '@/components/sidebar-footer'
import { SidebarList } from '@/components/sidebar-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
  IconSeparator,
  IconTwitter,
} from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { cn } from '@/lib/utils'
import { SignInButton, currentUser } from '@clerk/nextjs'
import LogoIcon from './ui/LogoIcon'

export async function Header() {

  const user = await currentUser();

  const serializableUser = {
    id: user?.id,
    name: user?.firstName,
    email: user?.emailAddresses[0].emailAddress,
    avatar_url: user?.profileImageUrl,
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        {user ? (
          <Sidebar>
            <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
              {/* @ts-ignore */}
              <SidebarList userId={user.id} />
            </React.Suspense>
            <SidebarFooter>
              <ThemeToggle />
              <ClearHistory clearChats={clearChats} />
            </SidebarFooter>
          </Sidebar>
        ) : (
          <Link href="/" target="_blank" rel="nofollow">
            <LogoIcon className="mr-3 h-6 w-6" />
          </Link>
        )}
        <div className="flex items-center">
          <IconSeparator className="h-6 w-6 text-muted-foreground/50" />
          {user ? (
            <UserMenu user={serializableUser} />
          ) : (
            <Button variant="ghost" asChild className="">
              <SignInButton />
            </Button>
          )}
        </div>
      </div>
      <div className="hidden grow items-center justify-center sm:flex">
        <span className="text-md brightness-20 font-semibold hover:brightness-150 dark:text-[#999]">
          <Link href="/"> s n o w B r a i n </Link>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div>
          <a
            target="_blank"
            href="https://github.com/kaarthik108/snowBrain"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconGitHub />
          </a>
        </div>
        <div>
          <a
            target="_blank"
            href="https://twitter.com/kaarthikcodes"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }))}
          >
            <IconTwitter />
          </a>
        </div>
      </div>
    </header>
  )
}
