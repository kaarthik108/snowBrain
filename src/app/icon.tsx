import LogoIcon from '@/components/ui/LogoIcon'
import { ImageResponse } from 'next/server'
import { cn } from 'utils/cn'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
// export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <LogoIcon color="white" width="32px" height="32px" className='' />
        ),
        // ImageResponse options
        {
            // For convenience, we can re-use the exported icons size metadata
            // config to also set the ImageResponse's width and height.
            ...size,
        }
    )
}