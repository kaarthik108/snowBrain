import IconGithub from './ui/IconGithub';
import IconLinkedIn from './ui/IconLinkedIn';
import IconMinimize2 from './ui/IconMinimize2';
import IconPlus from './ui/IconPlus';
import IconSeparator from './ui/IconSeparator';
import IconTwitter from './ui/IconTwitter';
import { default as LogoIcon } from './ui/LogoIcon';
import SnowLogo from './ui/SnowLogo';

type Props = {
    children: React.ReactNode;
    open: boolean;
    onClose: () => void;
    onNewChat: () => void;
}


export const Sidebar = ({ open, onClose, onNewChat, children }: Props) => {
    return (
        <section className={`fixed left-0 top-0 bottom-0 dark:text-white  text-zinc-700 ${open ? 'w-screen' : 'w-0'} md:w-64 md:static`} >
            <div className={`transition-all duration-200 flex h-screen ${open ? 'ml-0 ' : '-ml-96'} md:ml-0`}>
                <div className="flex flex-col w-64 p-2 shadow-md md:translate-x-0 dark:border-neutral-800 border-neutral-200 bg-white dark:bg-neutral-950 dark:text-neutral-50 ">
                    <div className='flex items-center mb-6 mt-3 pl-2 justify-start'>
                        <div className='flex justify-between items-center'>
                            <LogoIcon color="" width="24px" height="24px" className='text-[#999]' />

                        </div>

                        <div className='flex  '>
                            <IconSeparator color='gray' width="32px" height="32px" />
                        </div>
                        <div className='flex  '>
                            <span className='text-xl text-[#999]'>S n o w b r a i n</span>
                        </div>
                    </div>
                    <div onClick={onNewChat} className='flex items-center p-3 rounded-md text-sm cursor-pointer border border-black/20 dark:border-white/20 dark:hover:bg-gray-500/20 hover:bg-gray-500/20'>
                        <IconPlus width={16} height={16} className='mr-3' />
                        New Conversation
                    </div>
                    <nav className='flex-1 pt-2 overflow-y-auto '>
                        {children}
                    </nav>
                    <div className='border-t dark:border-gray-700 border-black/20 pt-2'>
                        <div className='flex justify-center gap-4 mb-2'>
                            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
                                <IconGithub width={24} height={24} className='brightness-50 hover:brightness-90' />
                            </a>
                            <a href="https://twitter.com/kaarthikcodes" target="_blank" rel="noopener noreferrer">
                                <IconTwitter width={24} height={24} className='brightness-50 hover:brightness-90' />
                            </a>
                            <a href="https://www.linkedin.com/in/kaarthik-andavar-b32a27143/" target="_blank" rel="noopener noreferrer">
                                <IconLinkedIn width={24} height={24} className='brightness-50 hover:brightness-90' />
                            </a>
                        </div>
                    </div>
                </div>
                <div onClick={onClose} className='flex justify-center items-center w-10 h-10 cursor-pointer md:hidden'>
                    <IconMinimize2 width={24} height={24} />
                </div>
            </div>
        </section>

    )
}