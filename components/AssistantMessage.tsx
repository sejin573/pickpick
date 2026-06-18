import { ReactNode } from "react";

export default function AssistantMessage({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-[13px] font-semibold text-white">
        P
      </span>
      <div
        className={
          wide
            ? "min-w-0 flex-1"
            : "w-fit min-w-0 max-w-[calc(100%-3rem)] sm:max-w-2xl"
        }
      >
        <p className="text-[11px] font-medium tracking-[0.18em] text-violet-500">
          PICKPICK AGENT
        </p>
        <div className="mt-1.5">{children}</div>
      </div>
    </div>
  );
}
