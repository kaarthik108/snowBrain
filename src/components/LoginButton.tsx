'use client'

import { signIn } from 'next-auth/react'
import * as React from 'react'
import { cn } from 'utils/cn'
import { Button } from './ui/Button'
import IconSpinner from './ui/IconSpinner'

interface LoginButtonProps {
    showGoogleIcon?: boolean
    text?: string
    className?: string

}


export function LoginButton({
    text = 'done',
    showGoogleIcon = true,
    className,
    ...props
}: LoginButtonProps) {
    const [isLoading, setIsLoading] = React.useState(false)
    return (
        <Button
            variant="ghost"
            onClick={() => {
                setIsLoading(true)
                signIn('google', { callbackUrl: `/` })
            }}
            disabled={isLoading}
            className={cn(className)}
            {...props}
        >
            {isLoading ? (
                <IconSpinner className="mr-2 animate-spin" />
            ) : showGoogleIcon ? (
                <span className="mr-2"> Signin </span>
            ) : null}
            {text}
        </Button>
    )
}