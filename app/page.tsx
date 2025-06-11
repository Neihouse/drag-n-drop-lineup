import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#121417]">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#2b2f36] px-10 py-3">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Primordial Groove</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-white text-sm font-medium leading-normal" href="#">Line-Up</a>
            </div>
            <Link
              href="/lineup"
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#dae4f5] text-[#121417] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#c1d3f0] transition-colors"
            >
              <span className="truncate">Go to Planner</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Hero Section */}
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-4"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdQS1esuteZzHxoNgj_shxuAkA4YOrQBemcZ2lVRipgTS3ijIbl2-Vko6KnlAyFRTU6ZNat7wjrqcvTh9FKxbR4c4YBmHEZZNrpalx2q_s5FdLXsaOBTNYYbsjGIiaXyB0SC8E54_unLW-5BZPER1IqzsiJ1qBb0GnrFUzqNw0ts6r9Nqtk97ALc1PqLwT_L6PmEzgzm43pdofwcEbUNb5bAcFdYyEfvIEeu3pFs4LQMhtpIP5w-ZQicCUwTAM-0X9fD0wu5IXxlI")'
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Line-Up Planner
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Drag and drop artists onto a live timeline to create line-ups in seconds.
                    </h2>
                  </div>
                  <Link
                    href="/lineup"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#dae4f5] text-[#121417] text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#c1d3f0] transition-colors"
                  >
                    <span className="truncate">Go to Planner</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="p-4">
              <div
                className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl pt-[132px]"
                style={{
                  backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBKZOXOmQkUFTAdhBW5f3kTvBjrutsazVB2IB_tQ19UgCT4eQ5lqZ8t6eMHZ29sE2jzR_Iu7X1I9YzMnM8sX1SmrCOc2ZnF-Wvnc9Zo3KWIYbMzFkIYchVJVz9YYbSlD8iGDh5ZcZySbxH4eBTqVxQVAmESaGqfzqAIUpV12BuoqN8f8tsAPYsytG_-wdKhHF9OgpiAQLUSpX0L0BGK3srVW8GgsBHUYkmeTLdCavgfOGUwgO8I35eIE0Q8jrMGKfnC9xs1YcUyAM8")'
                }}
              >
                <div className="flex w-full items-end justify-between gap-4 p-4">
                  <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                    <p className="text-white tracking-light text-2xl font-bold leading-tight max-w-[440px]">Key Features</p>
                    <p className="text-white text-base font-medium leading-normal">Drag artists, auto-save, one-click export</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
