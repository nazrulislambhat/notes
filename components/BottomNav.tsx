"use client";

type Tab = "home" | "list" | "editor";

export default function BottomNav({
  active,
  onHome,
  onFolders,
  onCreate,
  onSearch,
  onAccount,
}: {
  active: Tab;
  onHome: () => void;
  onFolders: () => void;
  onCreate: () => void;
  onSearch: () => void;
  onAccount: () => void;
}) {
  const itemClass = (isActive: boolean) =>
    `w-11 h-11 rounded-full flex items-center justify-center text-lg transition ${
      isActive ? "text-white" : "text-white/55"
    }`;

  return (
    <div
      className="md:hidden fixed left-0 right-0 bottom-0 z-50 flex justify-center pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
    >
      <div
        className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-full border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        style={{
          background: "rgba(20, 18, 30, 0.72)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        <button onClick={onHome} className={itemClass(active === "home")} aria-label="Home">
          🏠
        </button>
        <button onClick={onFolders} className={itemClass(active === "list")} aria-label="Notes">
          🗂️
        </button>

        <button
          onClick={onCreate}
          className="mx-1 flex items-center gap-1.5 pl-3 pr-4 py-2.5 rounded-full text-white text-sm font-medium active:scale-95 transition"
          style={{ background: "linear-gradient(135deg, #B9A6F8 0%, #F3B25E 100%)" }}
        >
          <span className="text-base leading-none">+</span> Create
        </button>

        <button onClick={onSearch} className={itemClass(false)} aria-label="Search">
          🔍
        </button>
        <button onClick={onAccount} className={itemClass(false)} aria-label="Account">
          👤
        </button>
      </div>
    </div>
  );
}
