"use client";

import { AVATAR_VERSION } from "../../lib/version";

interface AvatarDemoProps {
  className?: string;
}

export function AvatarDemo({ className = "" }: AvatarDemoProps) {
  return (
    <div
      className={`flex flex-row gap-32 items-center justify-center my-8 ${className}`}
    >
      {/* Normal Avatar */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <picture>
            <source
              srcSet={`/images/home/avatar-${AVATAR_VERSION}.webp`}
              type="image/webp"
            />
            <img
              className="bg-left-bottom h-20 w-20 rounded-full ring-2 ring-black dark:ring-white"
              src={`/images/home/avatar-${AVATAR_VERSION}.jpg`}
              alt="my face"
              width={80}
              height={80}
            />
          </picture>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">Normal Border</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Most of the year
          </p>
        </div>
      </div>

      {/* Pride Avatar */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div
            className="rounded-full"
            style={{
              boxShadow: `
                0 0 0 3px rgb(239 68 68),   /* red-500 - outermost */
                0 0 0 6px rgb(249 115 22),  /* orange-500 */
                0 0 0 9px rgb(250 204 21),  /* yellow-400 */
                0 0 0 12px rgb(34 197 94),  /* green-500 */
                0 0 0 15px rgb(59 130 246), /* blue-500 */
                0 0 0 18px rgb(147 51 234)  /* purple-500 - innermost */
              `,
            }}
          >
            <picture>
              <source
                srcSet={`/images/home/avatar-${AVATAR_VERSION}.webp`}
                type="image/webp"
              />
              <img
                className="bg-left-bottom h-20 w-20 rounded-full"
                src={`/images/home/avatar-${AVATAR_VERSION}.jpg`}
                alt="my face"
                width={80}
                height={80}
              />
            </picture>
          </div>
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">Pride Border 🏳️‍🌈</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            June & Manchester Pride week
          </p>
        </div>
      </div>
    </div>
  );
}
