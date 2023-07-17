'use client'

import * as React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { IconGitHub, IconSpinner } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs"

interface LoginButtonProps extends ButtonProps {
  showGithubIcon?: boolean
  text?: string
}

export function LoginButton({
  text = 'Login with GitHub',
  showGithubIcon = true,
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSignInButton, setShowSignInButton] = React.useState(false);

  // Create a Supabase client configured to use cookies
  return (
    <>
      <Button
        variant="outline"
        onClick={async () => {
          setIsLoading(true)
          setShowSignInButton(true);
        }}
        disabled={isLoading}
        className={cn(className)}
        {...props}
      >
        {isLoading ? (
          <IconSpinner className="mr-2 animate-spin" />
        ) : showGithubIcon ? (
          <IconGitHub className="mr-2" />
        ) : null}
        {text}
      </Button>
      {showSignInButton && <SignInButton />}
    </>

  )
}
