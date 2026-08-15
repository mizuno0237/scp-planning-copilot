export type GlossaryEntry = {
  term: string;
  aliases: string[];
  definition: string;
};

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Work order (WO)',
    aliases: ['wo', 'work order', 'workorder'],
    definition:
      'A shop-floor job ticket. On this board WO-1842 is the critical-path housing: mill on CNC-12, press on Assembly A, FAI at QC, then pack.',
  },
  {
    term: 'Finite capacity',
    aliases: ['finite capacity', 'finite-capacity', 'capacity'],
    definition:
      'A resource can run only one job at a time. Stretching CNC-12 does not create a second machine — downstream FS links slip.',
  },
  {
    term: 'Finish-to-start (FS)',
    aliases: ['fs', 'finish-to-start', 'finish to start'],
    definition:
      'Successor cannot start until the predecessor finishes. WO-1842 uses FS: mill → assembly → QC → pack.',
  },
  {
    term: 'Critical path',
    aliases: ['critical path', 'critical-path'],
    definition:
      'The longest FS chain that sets the promise. Here it is WO-1842 from CNC-12 mill through pack.',
  },
  {
    term: 'Promise date',
    aliases: ['promise date', 'promise', 'atp'],
    definition:
      'The datetime the planner commits to the customer. For WO-1842 it is the pack-lane finish on the sample shift.',
  },
  {
    term: 'Bottleneck',
    aliases: ['bottleneck', 'constraint', 'cnc-12'],
    definition:
      'The resource that gates throughput. CNC-12 is the constraint on this Heijunka board: extra mill hours push the whole WO-1842 chain.',
  },
  {
    term: 'Heijunka',
    aliases: ['heijunka', 'leveling'],
    definition:
      'Production leveling: mix and volume smoothed across the shift so the constraint is neither starved nor overloaded.',
  },
  {
    term: 'FAI / CMM',
    aliases: ['fai', 'cmm', 'first article'],
    definition:
      'First-article inspection on a coordinate measuring machine. QC Gate holds WO-1842 until FAI clears, then pack may start.',
  },
];

export function lookupGlossary(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOSSARY.slice(0, 4);
  const hits = GLOSSARY.filter(
    (entry) =>
      entry.term.toLowerCase().includes(q) ||
      entry.aliases.some((alias) => alias.includes(q) || q.includes(alias)),
  );
  return hits.length ? hits : GLOSSARY.slice(0, 3);
}
