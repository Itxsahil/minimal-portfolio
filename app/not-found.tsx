import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <Image
        src="/image.png"
        alt="Tux the Linux penguin"
        width={160}
        height={160}
        className="size-32 sm:size-40 object-contain"
        priority
      />

      <div className="relative">
        
        <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter font-[family-name:var(--font-stix-two-text)]">
          404
        </h1>
      </div>

      <p className="text-gray-500 dark:text-zinc-400 max-w-sm">
        Tux couldn&apos;t find this page. The link might be broken, or it may have wandered off.
      </p>
    </div>
  )
}
