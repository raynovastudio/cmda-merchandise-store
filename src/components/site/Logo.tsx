import logoFull from "@/assets/cmda-logo-full.png.asset.json";
import logoIcon from "@/assets/cmda-logo-icon.png.asset.json";

export function LogoFull({ className }: { className?: string }) {
  return (
    <img
      src={logoFull.url}
      alt="Christian Medical and Dental Association of Nigeria — Students' Arm"
      className={className ?? "h-10 w-auto"}
      width={1920}
      height={960}
    />
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logoIcon.url}
      alt="CMDA Nigeria"
      className={className ?? "h-10 w-auto"}
      width={512}
      height={800}
    />
  );
}
