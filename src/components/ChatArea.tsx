import { Chat } from '@/types/Chat';
import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
// import ChatMessageLoading from './ChatMessageLoading';
import { ChatPlaceholder } from './ChatPlaceholder';

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
            {/* {loading && <ChatMessageLoading />} */}
        </section>
    )
}
