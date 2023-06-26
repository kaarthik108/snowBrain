import { Chat } from '@/types/Chat';
import React, { useEffect, useRef } from 'react';
import { ChatPlaceholder } from './ChatPlaceholder';
import { Message } from './Message';
import IconOpenAI from './ui/IconOpenAI';

type Props = {
    chat: Chat | undefined;
    loading: boolean;
}


export const ChatBox = ({ chat, loading }: Props) => {
    const scrollArea = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollArea.current?.scrollTo(0, scrollArea.current?.scrollHeight);
    }, [loading, chat?.messages.length]);

    return (
        <section ref={scrollArea} className="flex-auto h-0 overflow-y-scroll overflow-x-hidden">
            <ChatPlaceholder />
            {chat && chat.messages.map(item => (
                <Message
                    key={item.id}
                    item={item}
                />
            ))}
            {loading && (
                <div className={`flex py-4 px-2 md:py-5 md:justify-center w-full max-w-full `}>
                    <div className={`w-8 h-8 md:w-10 md:h-10 flex md:ml-0 rounded items-center justify-center `}>

                        <IconOpenAI className='rounded-full' />
                    </div>
                    <div className='flex-1 markdown ml-2 mt-1 text-xs sm:text-sm max-w-3xl items-start justify-center dark:text-[#eaeaea] text-[#111] '>
                        <div className="w-[calc(100%-50px)]">
                        </div>
                        <div className="flex items-center justify-start md:px-30 md:mr-10 w-full max-w-3xl ">
                            <div className='flex justify-start'>
                                <div className="flex items-center justify-center gap-1 py-1 text-sm rounded-md max-w-fit dark:bg-neutral-950/50 ">

                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-ping" />
                                    <span>Thinking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}