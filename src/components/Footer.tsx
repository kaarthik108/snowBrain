import React from 'react';
import { MessageInput } from './MessageInput';

type Props = {
    disabled: boolean;
    onSendMessage: (message: string) => void;

}


export const Footer = ({ disabled, onSendMessage }: Props) => {
    return (
        <footer className='w-full p-2 bg-gradient-to-b from-transparent dark:via-neutral-950/60 dark:to-neutral-950/90 via-neutral-50/60 to-neutral-50/90'>
            <div className='max-w-4xl m-auto'>
                <MessageInput
                    disabled={disabled}
                    onSend={onSendMessage}
                />
                <div className='pt-3 text-center text-xs text-zinc-400 mb-1'>
                    Powered by GPT3.5

                </div>
            </div>

        </footer>
    )
}
