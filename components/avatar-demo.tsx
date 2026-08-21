import { AVATAR_SRC } from '@/lib/avatar';
import { PrideAvatar } from './pride-avatar';

export function AvatarDemo({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex flex-row items-center justify-between my-8 px-8 ${className}`}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <PrideAvatar forceState="normal">
            <picture>
              <source srcSet={AVATAR_SRC.webp} type="image/webp" />
              <img
                className="bg-left-bottom h-20 w-20 rounded-full"
                src={AVATAR_SRC.jpg}
                alt="my face"
                width={80}
                height={80}
              />
            </picture>
          </PrideAvatar>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">Normal Border</p>
          <p className="text-xs text-muted-foreground">Most of the year</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <PrideAvatar forceState="pride">
            <picture>
              <source srcSet={AVATAR_SRC.webp} type="image/webp" />
              <img
                className="bg-left-bottom h-20 w-20 rounded-full"
                src={AVATAR_SRC.jpg}
                alt="my face"
                width={80}
                height={80}
              />
            </picture>
          </PrideAvatar>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">Pride Border 🏳️‍🌈</p>
          <p className="text-xs text-muted-foreground">
            June & Manchester Pride week
          </p>
        </div>
      </div>
    </div>
  );
}
