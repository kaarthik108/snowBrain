import React, { useContext } from 'react';
import { MessageInput } from './MessageInput';
import { TokenCountContext } from './token';

type Props = {
    disabled: boolean;
    onSendMessage: (message: string) => void;

}

export const Footer = ({ disabled, onSendMessage }: Props) => {
    const { currentMessageToken, setCurrentMessageToken } = useContext(TokenCountContext); // use context

    return (
        <footer className='w-full p-2 bg-gradient-to-b from-transparent dark:via-neutral-950/60 dark:to-neutral-950/90 via-neutral-50/60 to-neutral-50/90'>
            <div className="flex items-center justify-center bg-transparent dark:bg-inherit px-2 py-2 rounded-md shadow-sm ">
                <span className=" dark:text-neutral-400 text-sm">Token Size: </span>
                <div
                    className="w-2 h-2 mx-1 rounded-full bg-emerald-400"
                />
                <span className="text-xs text-neutral-200">{currentMessageToken}</span>
            </div>
            <div className='max-w-4xl m-auto'>

                <MessageInput
                    disabled={disabled}
                    onSend={onSendMessage}
                />
                <div className='pt-3 text-center text-xs text-zinc-700 dark:text-zinc-400 mb-2'>
                    Powered by GPT3.5

                </div>
            </div>

        </footer>
    )
}
