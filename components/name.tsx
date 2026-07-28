import Image from "next/image";

export const NameTransition = () => {
  return (
    <span className="flex flex-col md:flex-row justify-end md:space-x-14 w-full mb-10">

      <div className="relative shrink p-4 md:p-4 md:order-last order-first">
        <a
          href="https://x.com/sahilkhan_dev"
          target="_blank"
          rel="noopener noreferrer"
          className="block z-5 overflow-hidden rounded shadow-xl ring-1 ring-slate-900/5 relative bg-white h-30 w-30"
        >
          <Image
            src="/bald.png"
            alt="Sahil Khan — Full-Stack Developer & Technical Writer"
            fill
            priority
            sizes="120px"
            className="object-cover"
          />
        </a>

        <div className="z-0">
          <div className="absolute left-0 -right-12 top-0 h-px bg-slate-900/10 dark:bg-zinc-300/10 
      mask-[linear-gradient(to_right,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute -top-8 bottom-0 left-12 w-px bg-slate-900/10 dark:bg-zinc-300/10 
      mask-[linear-gradient(to_top,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute left-0 -right-12 bottom-14 h-px bg-slate-900/10 dark:bg-zinc-300/10 
      mask-[linear-gradient(to_right,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute right-0 -top-2 -bottom-8 w-px bg-slate-900/10 dark:bg-zinc-300/10 
      mask-[linear-gradient(to_top,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute bottom-full right-10 -mb-px flex h-8 items-end overflow-hidden">
            <div className="flex -mb-px h-0.5 w-40 -scale-x-100">
              <div className="w-full flex-none blur-sm 
          bg-[linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]" />

              <div className="ml-[-100%] w-full flex-none blur-[1px] 
          bg-[linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]" />
            </div>
          </div>
        </div>
      </div>


    </span>

  );
};



export const Hi = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="text-2xl font-bold">Hi</div>
      {/* <div className="text-2xl font-bold animate-bounce">👋</div> */}
    </div>
  );
};
