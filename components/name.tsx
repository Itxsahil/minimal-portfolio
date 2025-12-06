import Image from "next/image";

export const NameTransition = () => {
  return (
    <span className="flex flex-col md:flex-row justify-end md:space-x-14 w-full mb-10">

      <div className="relative flex-shrink-1 p-4 md:p-4 md:order-last order-first">
        <a
          href="https://x.com/sahilkhan_dev"
          target="_blank"
          rel="noopener noreferrer"
          className="block z-[5] overflow-hidden rounded shadow-xl ring-1 ring-slate-900/5 relative bg-white h-20 w-20"
        >
          <span
            style={{
              boxSizing: "border-box",
              display: "block",
              overflow: "hidden",
              width: "initial",
              height: "initial",
              background: "none",
              opacity: 1,
              border: 0,
              margin: 0,
              padding: 0,
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          >
            <Image
              // className="md:mt-12 h-24 w-24 rounded-xl shadow-2xs z-10"
              src="/bald.jpeg"
              alt="Picture of the author"
              width={500}
              height={500}
            />
          </span>
        </a>

        <div className="z-0">
          <div className="absolute left-0 -right-12 top-0 h-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] 
      [mask-image:linear-gradient(to_right,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute -top-8 bottom-0 left-12 w-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] 
      [mask-image:linear-gradient(to_top,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute left-0 -right-12 bottom-14 h-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] 
      [mask-image:linear-gradient(to_right,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute right-0 -top-2 -bottom-8 w-px bg-slate-900/[0.1] dark:bg-zinc-300/[0.1] 
      [mask-image:linear-gradient(to_top,transparent,white_4rem,white_calc(100%-4rem),transparent)]" />

          <div className="absolute bottom-full right-10 -mb-px flex h-8 items-end overflow-hidden">
            <div className="flex -mb-px h-[2px] w-40 -scale-x-100">
              <div className="w-full flex-none blur-sm 
          [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]" />

              <div className="-ml-[100%] w-full flex-none blur-[1px] 
          [background-image:linear-gradient(90deg,rgba(56,189,248,0)_0%,#0EA5E9_32.29%,rgba(236,72,153,0.3)_67.19%,rgba(236,72,153,0)_100%)]" />
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