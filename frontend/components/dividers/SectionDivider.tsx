import { DIVIDERS, DividerId } from './config';

export default function SectionDivider({ id }: { id?: DividerId | string | null }) {
  if (!id || id === 'none' || !(id in DIVIDERS)) return null;
  const { Component } = DIVIDERS[id as Exclude<DividerId, 'none'>];

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 my-2">
      <Component />
    </div>
  );
}
