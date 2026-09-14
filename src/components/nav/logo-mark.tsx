import Image from "next/image";
import logo from "../../../public/brand/logo.png";

export function LogoMark({ className = "h-9" }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="Brasão InterEng Alagoas"
      className={`w-auto ${className}`}
      priority
    />
  );
}
