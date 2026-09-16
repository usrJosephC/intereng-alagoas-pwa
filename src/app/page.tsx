import Link from "next/link";
import { LogoMark } from "@/components/nav/logo-mark";
import { HeroBackdrop } from "@/components/three/hero-backdrop";
import { LinkButton } from "@/components/ui/button";
import { SPORTS, SPORT_LABELS, SPORT_SLUGS } from "@/lib/sports";
import { SportIconImage } from "@/components/ui/sport-icon-image";

export default function HomePage() {
  return (
    <div>
      <section className="relative mx-auto flex max-w-3xl flex-col items-center overflow-hidden px-4 py-14 text-center sm:py-20">
        <HeroBackdrop />
        <LogoMark className="h-24 sm:h-28" />
        <h1 className="font-display mt-6 text-4xl font-normal uppercase text-gradient-gold sm:text-6xl">
          InterEng Alagoas
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">
          Mais que um evento, um movimento. Acompanhe o sorteio de grupos, a tabela de
          jogos e a torcida do campeonato inter-atléticas de engenharia do estado de
          Alagoas.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/agenda">Ver agenda de hoje</LinkButton>
          <LinkButton href="/comunidade" variant="secondary">
            Entrar na comunidade
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="font-heading text-center text-lg font-semibold uppercase tracking-wide text-muted">
          Modalidades
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SPORTS.map((sport) => (
            <Link
              key={sport}
              href={`/tabela/${SPORT_SLUGS[sport]}`}
              className="steel-border flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-sm bg-surface p-4 text-center text-gold transition-colors hover:border-gold"
            >
              <SportIconImage sport={sport} className="h-9 w-9" />
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-foreground">
                {SPORT_LABELS[sport]}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
