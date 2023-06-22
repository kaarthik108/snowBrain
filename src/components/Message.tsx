import { ChatMessage } from '@/types/ChatMessage';
import { useContext, useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
// import { useCopyToClipboard } from '../../hooks/use-copy-to-clipboard';
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

    // Use an effect to update the token count
    useEffect(() => {
        // Split the content on whitespace and punctuation to approximate tokens
        const approxTokens = item.content.split(/[\s,.!?]+/).length;
        setCurrentMessageToken(approxTokens);
    }, [item.content, setCurrentMessageToken]);

    const codeRef = useRef<HTMLElement>(null);
    const isImageMessage = item.content.startsWith('https://res.cloudinary.com/');
    console.log(isImageMessage);

    return (
        <div className={`py-5 flex px-6 md:px-48 ${item.author === 'user' && 'dark:bg-neutral-950/60 bg-neutral-100/50'}`}>
            <div className={`w-10 h-10 flex md:ml-0 rounded items-center justify-center ${item.author === 'assistant' ? '' : ''}`}>
                {item.author === 'user' && <IconSnow className='rounded-full' width='32' height='32' />}
                {item.author === 'assistant' && <IconOpenAI className='rounded-full' />}
            </div>
            <div className='flex-1 break-words markdown ml-2 mt-1 text-sm items-center justify-center dark:text-[#eaeaea] text-[#111]'>
                <ReactMarkdown
                    className="break-words markdown mt-1"
                    components={{
                        code: ({ children, inline, className }) => {
                            const language = className?.split("-")[1];
                            if (inline)
                                return (
                                    <span className="px-1 py-1 text-sm rounded-md dark:bg-neutral-800 bg-neutral-50">
                                        {children}
                                    </span>
                                );
                            return (
                                <div className="w-full my-6 overflow-hidden rounded-md dark:bg-neutral-950/60">
                                    <div className="dark:bg-[#1e283880] bg-neutral-50 py-2 px-3 text-xs flex items-center justify-between">
                                        <div>{language ?? "sql"}</div>
                                        <CopyToClipboard text={codeRef?.current?.innerText as string} onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 3000) }}>
                                            <button className="flex items-center gap-1">
                                                <IconClipboard width={10} />
                                                {copied ? 'Copied!' : 'Copy'}
                                            </button>
                                        </CopyToClipboard>
                                    </div>
                                    <code
                                        ref={codeRef}
                                        className={
                                            (className ?? "hljs language-javascript ") +
                                            " dark:bg-[#1e283880] bg-neutral-50 block p-3 overflow-auto border-t border-t-gray-300/40"
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
    )
}