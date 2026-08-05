import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work & Experience',
  description:
    'Career history, skills, education, and technologies used by Sam Ainsworth, Senior Software Developer and Cloud Engineer.',
};

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        work & experience 💼
      </h1>
      {children}
    </div>
  );
}
