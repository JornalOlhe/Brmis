import { Fragment, useRef, type CSSProperties } from "react";

import { useScrollVar } from "@/lib/motion";

const cssVars = (vars: Record<string, number>) => vars as CSSProperties;

/** Words that rise out of a mask when the closest `.reveal` ancestor becomes visible. */
export function SplitText({ text, from = 0 }: { text: string; from?: number }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="split-word">
            <span style={cssVars({ "--i": from + i })}>{word}</span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

/** A paragraph whose words light up one by one as it travels up the viewport. */
export function ScrubText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  useScrollVar(
    ref,
    "--p",
    (rect, viewport) => (viewport * 0.9 - rect.top) / (viewport * 0.5),
  );
  const words = text.split(" ");
  return (
    <p
      ref={ref}
      className={`scrub ${className}`}
      style={cssVars({ "--n": words.length })}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span style={cssVars({ "--i": i })}>{word}</span>{" "}
        </Fragment>
      ))}
    </p>
  );
}
