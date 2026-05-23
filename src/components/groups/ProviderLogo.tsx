import Image from 'next/image'
import type { Platform } from '@/types'

const PROVIDER_ASSETS: Record<Platform, { src: string; label: string }> = {
    telegram: { src: '/images/telegram-logo-lubot.png', label: 'Telegram' },
    whatsapp: { src: '/images/whatsapp-logo-lubot.png', label: 'WhatsApp' },
    discord:  { src: '/images/discord-logo-lubot.webp', label: 'Discord' },
    slack:    { src: '/images/slack-logo-lubot.png', label: 'Slack' },
}

interface ProviderLogoProps {
    platform: string
    size?: number
}

export function ProviderLogo({ platform, size = 24 }: ProviderLogoProps) {
    const asset = PROVIDER_ASSETS[platform as Platform]

    if (!asset) {
        return (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-muted text-[10px] font-medium text-muted-foreground uppercase">
                {platform?.[0] ?? '?'}
            </span>
        )
    }

    return (
        <Image
            src={asset.src}
            alt={asset.label}
            width={size}
            height={size}
            className="rounded-sm object-contain"
        />
    )
}
