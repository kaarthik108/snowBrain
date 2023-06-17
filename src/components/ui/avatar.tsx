import Image from 'next/image';
import React from 'react';

type AvatarProps = {
    imgSrc: string;
    altText: string;
    size?: string;
}

const Avatar: React.FC<AvatarProps> = ({ imgSrc, altText, size = 'w-16 h-16' }) => {
    const classes = `rounded-full ${size} object-cover`;

    return (
        <Image
            src={imgSrc}
            alt={altText}
            className={classes}
            width={24}
            height={24}
        />
    );
};

export default Avatar;
