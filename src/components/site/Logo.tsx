export function LogoFull({ className }: { className?: string }) {
  return (
    <img
      src="/CMDA LOGO.jpeg"
      alt="Christian Medical and Dental Association of Nigeria — Students' Arm"
      className={className ?? "h-10 w-auto"}
    />
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/CMDA LOGO.jpeg"
      alt="CMDA Nigeria"
      className={className ?? "h-10 w-auto"}
    />
  );
}
