"use client";

import { ChatMessage } from '@/types/ChatMessage';
import { useContext, useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { TokenCountContext } from './token';
import IconClipboard from './ui/IconClipboard';
import IconOpenAI from './ui/IconOpenAI';
import IconSnow from './ui/IconSnow';

type Props = {
    item: ChatMessage;
}
export const Message = ({ item }: Props) => {
    const { setCurrentMessageToken } = useContext(TokenCountContext);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (item.content) {
            const approxTokens = item.content.split(/[\s,.!?]+/).length;
            setCurrentMessageToken(approxTokens);
        }
    }, [item.content, setCurrentMessageToken]);

    const codeRef = useRef<HTMLElement>(null);
    const isImageMessage = item?.content?.startsWith && item.content.startsWith('https://res.cloudinary.com/');

    return (
        <div className={`flex py-4 px-2 md:py-5 md:justify-center w-full max-w-full ${item.author === 'user' && 'dark:bg-neutral-950/60 bg-neutral-100/50'} `}>
            <div className={`w-8 h-8 md:w-10 md:h-10 flex md:ml-0 rounded items-center justify-center ${item.author === 'assistant' ? '' : ''}`}>
                {item.author === 'user' && <IconSnow className='rounded-full' width='28' height='28' />}
                {item.author === 'assistant' && <IconOpenAI className='rounded-full' />}
            </div>
            <div className='flex-1 markdown ml-2 mt-1 text-xs sm:text-sm max-w-3xl items-start justify-center dark:text-[#eaeaea] text-[#111] '>
                <div className="w-[calc(100%-50px)]">
                    <ReactMarkdown
                        className="break-words markdown mt-1"
                        components={{
                            code: ({ children, inline, className }) => {
                                const language = className?.split("-")[1];
                                if (inline)
                                    return (
                                        <span className="px-1 py-1 text-xs sm:text-sm rounded-md dark:bg-neutral-800 bg-neutral-50">
                                            {children}
                                        </span>
                                    );
                                return (
                                    <div className="w-full my-4 sm:my-6 overflow-hidden rounded-md dark:bg-neutral-950/60 bg-gray-800 text-white">
                                        <div className="bg-[#1e283880]  py-1 sm:py-2 px-2 sm:px-3 text-xs flex items-center justify-between">
                                            <div>{language ?? "sql"}</div>
                                            <CopyToClipboard text={codeRef?.current?.innerText as string} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 3000) }}>
                                                <button className="flex items-center gap-1">
                                                    <IconClipboard width={8} />
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </CopyToClipboard>
                                        </div>
                                        <code
                                            ref={codeRef}
                                            className={
                                                (className ?? "hljs language-javascript ") +
                                                " dark:bg-[#1e283880] text-[#eaeaea] block p-3 overflow-auto border-t border-t-gray-300/40"
                                            }
                                        >
                                            {children}
                                        </code>
                                    </div>
                                );
                            },
                        }}
                        rehypePlugins={[rehypeHighlight]}
                        remarkPlugins={[remarkGfm]}
                    >
                        {isImageMessage ? `![matplot graph](${item.content})` : item.content ?? ""}

                    </ReactMarkdown>


                </div>
            </div>
        </div>
    )

}