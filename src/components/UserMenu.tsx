'use client'

import { type Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

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
                            <div className="flex items-center justify-center text-xs font-medium uppercase rounded-full select-none h-7 w-7 shrink-2 bg-muted/50 text-[#999] text-muted-foreground cursor-pointer">
                                {user?.name ? getUserInitials(user?.name) : null}
                            </div>
                        )}
                        <span className="mt-1 ml-2 text-[#999]">{user?.name}</span>
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