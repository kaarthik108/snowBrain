import { Chat } from '@/types/Chat';
import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
// import ChatMessageLoading from './ChatMessageLoading';
import { ChatPlaceholder } from './ChatPlaceholder';
import IconOpenAI from './ui/IconOpenAI';

type Props = {
    chat: Chat | undefined;
    loading: boolean;
}


export const ChatArea = ({ chat, loading }: Props) => {
    const scrollArea = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollArea.current?.scrollTo(0, scrollArea.current?.scrollHeight);
    }, [loading, chat?.messages.length]);

    return (
        <section ref={scrollArea} className="flex-auto h-0 overflow-y-scroll">
            <ChatPlaceholder />
            {chat && chat.messages.map(item => (
                <Message
                    key={item.id}
                    item={item}
                />
            ))}
            {loading && (
                <div className="flex-auto md:px-48 sm:px-6 px-2">
                    <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-md max-w-fit dark:bg-neutral-950/50 ">
                        <IconOpenAI className='rounded-full mr-1' />
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
                        <span>Thinking</span>
                    </div>
                </div>
            )}
        </section>
    )
}
