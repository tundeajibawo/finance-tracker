const groups = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const fmt = (n: number): string => (n < 0 ? `-₦${groups(Math.abs(n))}` : `₦${groups(n)}`);

export const fmtSigned = (n: number): string => (n < 0 ? `-₦${groups(Math.abs(n))}` : `+₦${groups(n)}`);
