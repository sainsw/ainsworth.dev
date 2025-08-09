"use client";

import { useEffect, useState } from "react";

interface PrideAvatarProps {
  children: React.ReactNode;
  className?: string;
}

export function PrideAvatar({ children, className = "" }: PrideAvatarProps) {
  const [isPrideTime, setIsPrideTime] = useState(false);

  useEffect(() => {
    const checkPrideTime = () => {
      const now = new Date();
      const month = now.getMonth() + 1; // getMonth() is 0-indexed
      const date = now.getDate();

      // Pride Month - entire June
      if (month === 6) {
        setIsPrideTime(true);
        return;
      }

      // Manchester Pride - week leading up to August bank holiday (including the Monday)
      if (month === 8) {
        const year = now.getFullYear();

        // Find the last Monday of August (August bank holiday)
        const lastDayOfMonth = new Date(year, 8, 0).getDate(); // August has 31 days
        let lastMonday = lastDayOfMonth;
        const lastDayWeekday = new Date(year, 7, lastDayOfMonth).getDay(); // 0=Sunday, 1=Monday

        // Calculate the date of the last Monday
        if (lastDayWeekday === 1) {
          // If last day is Monday, that's our bank holiday
          lastMonday = lastDayOfMonth;
        } else {
          // Otherwise, find the previous Monday
          lastMonday = lastDayOfMonth - ((lastDayWeekday + 6) % 7);
        }

        // Manchester Pride week: 7 days before bank holiday Monday through bank holiday Monday
        const prideWeekStart = lastMonday - 7; // Week before
        const prideWeekEnd = lastMonday; // Including bank holiday Monday

        // Handle edge case where week might start in July
        const adjustedStart = Math.max(1, prideWeekStart);

        if (date >= adjustedStart && date <= prideWeekEnd) {
          setIsPrideTime(true);
          return;
        }
      }

      setIsPrideTime(false);
    };

    checkPrideTime();

    // Check daily at midnight
    const interval = setInterval(checkPrideTime, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isPrideTime) {
    return (
      <div
        className={`ring-2 ring-black dark:ring-white rounded-full ${className}`}
      >
        {children}
      </div>
    );
  }

  // Traditional Pride rainbow colours using box-shadow for concentric rings
  // 6 colours, 3px thick each for bold visibility while maintaining smooth curves
  // From outermost to innermost: Red, Orange, Yellow, Green, Blue, Purple
  return (
    <div className={`relative ${className}`}>
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
        {children}
      </div>
    </div>
  );
}
