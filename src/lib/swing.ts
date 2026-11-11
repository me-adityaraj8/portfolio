/**
 * The physics of the hero's ID badge: a weight hanging from a strap that is pinned at the
 * origin. The strap is slack when the weight is closer than its length and pulls back like
 * a stiff spring when it is further, so the badge swings, bounces a little and settles.
 * Positions are in pixels with y pointing down; angles are in degrees.
 */
export interface Bob { x: number; y: number; vx: number; vy: number }

const GRAVITY = 2600;   // px/s²
const STIFF = 420;      // strap spring, 1/s²
const DRAG = 1.1;       // air, 1/s
const STRAP_DRAG = 18;  // kills the bounce along the strap, 1/s
const MAX_STRETCH = 1.3;
const SUBSTEP = 1 / 240;

/** Where the weight ends up: the strap's length plus the little it stretches under gravity. */
export const restY = (len: number) => len + GRAVITY / STIFF;

export function stepBob(b: Bob, len: number, dt: number): Bob {
  let { x, y, vx, vy } = b;
  const steps = Math.max(1, Math.ceil(dt / SUBSTEP));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    let ax = -DRAG * vx, ay = GRAVITY - DRAG * vy;
    const d = Math.hypot(x, y) || 1;
    const nx = x / d, ny = y / d;
    if (d > len) {
      const along = vx * nx + vy * ny;
      const pull = STIFF * (d - len) + STRAP_DRAG * along;
      ax -= pull * nx; ay -= pull * ny;
    }
    vx += ax * h; vy += ay * h;
    x += vx * h; y += vy * h;
    const d2 = Math.hypot(x, y);
    if (d2 > len * MAX_STRETCH) {
      const ux = x / d2, uy = y / d2, out = vx * ux + vy * uy;
      x = ux * len * MAX_STRETCH; y = uy * len * MAX_STRETCH;
      if (out > 0) { vx -= out * ux; vy -= out * uy; }
    }
  }
  return { x, y, vx, vy };
}

/** The badge hangs along the strap: its tilt, clockwise positive, as CSS wants it. */
export const hangAngle = (b: Bob) => (-Math.atan2(b.x, b.y) * 180) / Math.PI;

/** True once the weight is as good as still, so the animation loop can stop. */
export const atRest = (b: Bob, len: number) => Math.abs(b.x) < 0.3 && Math.abs(b.y - restY(len)) < 0.3 && Math.hypot(b.vx, b.vy) < 3;
