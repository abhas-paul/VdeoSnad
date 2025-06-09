'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

const cards = ({ className, img, title, description, handleClick }) => {
  return (
    <article
      className={cn(
        'bg-orange-1 px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      <figure className="flex-center glassmorphism size-12 rounded-[10px]">
        <Image src={img} alt="meeting" width={27} height={27} />
      </figure>

      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg font-normal">{description}</p>
      </section>
    </article>
  );
};

export default cards;
