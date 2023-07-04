import React from "react";
import IconMenu from "./ui/IconMenu";
import IconPlus from "./ui/IconPlus";

type Props = {
  openSidebarClick: () => void;
  title: string;
  newChatClick: () => void;
};

export const Header = ({ openSidebarClick, title, newChatClick }: Props) => {
  return (
    <header className="flex items-center justify-between w-full border-b border-b-gray-600 p-2 lg:hidden ">
      <div onClick={openSidebarClick}>
        <IconMenu width={24} height={24} />
      </div>

      <div className="mx-2 truncate ">{title}</div>
      <div onClick={newChatClick}>
        <IconPlus width={24} height={24} />
      </div>
    </header>
  );
};
