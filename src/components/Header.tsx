import { Menu, Plus } from 'lucide-react';
import React from 'react';

type Props = {
    openSidebarClick: () => void;
    title: string;
    newChatClick: () => void;

}

export const Header = ({ openSidebarClick, title, newChatClick }: Props) => {
    return (
        <header className='flex items-center justify-between w-full border-b border-b-gray-600 p-2 md:hidden '>

            <div onClick={openSidebarClick}>

                <Menu width={24} height={24} />
            </div>

            <div className='mx-2 truncate'>{title}</div>
            <div onClick={newChatClick}>
                <Plus width={24} height={24} />
            </div>

        </header>
    );
}
