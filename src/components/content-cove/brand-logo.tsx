export function BrandLogo({ size = 52 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-2xl bg-[var(--gradient-main)] opacity-60 blur-xl" aria-hidden />
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className="relative rounded-2xl border border-white/20 bg-black/70 p-3 shadow-soft backdrop-blur"
      >
        <defs>
          <linearGradient id="sigiloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B63FF" />
            <stop offset="60%" stopColor="#9E57E8" />
            <stop offset="100%" stopColor="#D85DB2" />
          </linearGradient>
        </defs>
        <path
          d="M32 6C18.192 6 7 17.192 7 31s11.192 25 25 25 25-11.192 25-25S45.808 6 32 6zm0 4c11.58 0 21 9.42 21 21s-9.42 21-21 21S11 42.58 11 31 20.42 10 32 10z"
          fill="url(#sigiloGradient)"
          opacity="0.8"
        />
        <path
          d="M21 23c0-2.761 2.239-5 5-5h12c4.418 0 8 3.582 8 8v4c0 4.418-3.582 8-8 8H21V23zm7.5 5.5v7h7.25a3.75 3.75 0 0 0 0-7.5H28.5z"
          fill="url(#sigiloGradient)"
        />
      </svg>
    </div>
  );
}

