import '../styles/sections/waveform.css';

/**
 * A cut's crunch signature: 24 bars. Static by default; pass a changing
 * `hit` number to replay the strike animation (it remounts the bars).
 */
export default function Waveform({ values, hit = 0, className = '', label }) {
  return (
    <span className={`wave ${hit ? 'is-hit' : ''} ${className}`} key={hit} role="img" aria-label={label || 'Sound waveform'}>
      {values.map((v, i) => (
        <i key={i} style={{ '--v': Math.max(0.035, v), '--i': i }} />
      ))}
    </span>
  );
}
