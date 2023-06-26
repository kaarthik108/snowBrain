import LogoIcon from '@/components/ui/LogoIcon'
import { ImageResponse } from 'next/server'

export const runtime = 'edge'

export const size = {
    width: 32,
    height: 32,
}
// export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <LogoIcon color="white" width="32px" height="32px" className='' />
        ),
        // ImageResponse options
        {
            ...size,
        }
    )
}