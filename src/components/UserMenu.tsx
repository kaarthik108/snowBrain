'use client'

import { type Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { cn } from 'utils/cn'

import { Button } from '@/components/ui/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/DropDownmenu'

export interface UserMenuProps {
    user: Session['user']
}

function getUserInitials(name: string) {
    const [firstName, lastName] = name.split(' ')
    return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}
function IconExternalLink({
    className,
    ...props
}: React.ComponentProps<'svg'>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className={cn('h-4 w-4', className)}
            viewBox="0 0 256 256"
            {...props}
        >
            <path d="M224 104a8 8 0 0 1-16 0V59.32l-66.33 66.34a8 8 0 0 1-11.32-11.32L196.68 48H152a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm-40 24a8 8 0 0 0-8 8v72H48V80h72a8 8 0 0 0 0-16H48a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-72a8 8 0 0 0-8-8Z" />
        </svg>
    )
}
export function UserMenu({ user }: UserMenuProps) {
    return (
        <div className="flex items-center justify-between py-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="pl-0">
                        {user?.image ? (
                            <Image
                                className="w-6 h-6 transition-opacity duration-300 rounded-full select-none ring-1 ring-zinc-100/10 hover:opacity-80"
                                src={user?.image ? `${user.image}` : ''}
                                alt={user.name ?? 'Avatar'}
                                width={24}
                                height={24}
                            />
                        ) : (
                            <div className="flex items-center justify-center text-xs font-medium uppercase rounded-full select-none h-7 w-7 shrink-2 bg-muted/50 text-[#999]text-muted-foreground cursor-pointer">
                                {user?.name ? getUserInitials(user?.name) : null}
                            </div>
                        )}
                        <span className="ml-1">{user?.name}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="start" className=" w-[180px]">
                    <DropdownMenuItem className="flex-col items-start">
                        <div className="text-xs font-medium ">{user?.name}</div>
                        <div className="text-xs ">{user?.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() =>
                            signOut({
                                callbackUrl: '/'
                            })
                        }
                        className="w-full text-xs "
                    >
                        Log Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}