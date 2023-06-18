"use client";

import { encode } from "@nem035/gpt-3-encoder";
import React, { createContext, useEffect, useState } from 'react';

// Update context type definition
interface TokenCountContextProps {
    currentMessage: string;
    setCurrentMessage: React.Dispatch<React.SetStateAction<string>>;
    currentMessageToken: number;
    setCurrentMessageToken: React.Dispatch<React.SetStateAction<number>>;
}

// Update context initial value
export const TokenCountContext = React.createContext<TokenCountContextProps>({
    currentMessage: '',
    setCurrentMessage: () => { },
    currentMessageToken: 0,
    setCurrentMessageToken: () => { },
});

// Update provider component
export const TokenCountProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [currentMessageToken, setCurrentMessageToken] = useState(0);

    useEffect(() => {
        // console.log("currentMessage--", currentMessage);
        const currentMessageToken = encode(currentMessage).length;
        setCurrentMessageToken(currentMessageToken);
    }, [currentMessage]);
    return (
        <TokenCountContext.Provider value={{ currentMessage, setCurrentMessage, currentMessageToken, setCurrentMessageToken }}>
            {children}
        </TokenCountContext.Provider>
    );
};
