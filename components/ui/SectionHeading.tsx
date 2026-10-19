import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
};

export function SectionHeading({ eyebrow, title, children, align = "left", id }: Props) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-brand uppercase">
        <span aria-hidden className="h-px w-8 bg-brand" />
        {eyebrow}
      </p>
      <h2 id={id} className="text-3xl font-extrabold text-balance text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>
      {children && <p className="mt-5 text-lg leading-relaxed text-muted">{children}</p>}
    </Reveal>
  );
}
