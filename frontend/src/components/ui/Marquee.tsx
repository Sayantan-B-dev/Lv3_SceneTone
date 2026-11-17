const TEXT = '蒸気波 · PEAK · RMS · CREST · 7 BANDS · BLUEPRINT · FL STUDIO · LOCAL FIRST · ';

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <p className="marquee__group">{TEXT.repeat(3)}</p>
        <p className="marquee__group">{TEXT.repeat(3)}</p>
      </div>
    </div>
  );
}
