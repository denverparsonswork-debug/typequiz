export interface ItemInfo {
  name: string;
  description: string;
  category: 'Offensive' | 'Defensive' | 'Utility';
}

export const COMPETITIVE_ITEMS: ItemInfo[] = [
  {
    name: 'Choice Scarf',
    description: 'Boosts Speed by 50%, but only allows the use of the first move selected.',
    category: 'Utility'
  },
  {
    name: 'Choice Band',
    description: 'Boosts Attack by 50%, but only allows the use of the first move selected.',
    category: 'Offensive'
  },
  {
    name: 'Choice Specs',
    description: 'Boosts Sp. Atk by 50%, but only allows the use of the first move selected.',
    category: 'Offensive'
  },
  {
    name: 'Life Orb',
    description: 'Boosts the power of moves by 30%, but at the cost of 10% max HP per attack.',
    category: 'Offensive'
  },
  {
    name: 'Focus Sash',
    description: 'If the holder has full HP, it will endure a potential OHKO with 1 HP.',
    category: 'Defensive'
  },
  {
    name: 'Assault Vest',
    description: 'Boosts Sp. Def by 50%, but prevents the use of status moves.',
    category: 'Defensive'
  },
  {
    name: 'Leftovers',
    description: 'Restores 1/16 of the holder\'s maximum HP at the end of every turn.',
    category: 'Defensive'
  },
  {
    name: 'Rocky Helmet',
    description: 'If the holder is hit by a contact move, the attacker loses 1/6 of their max HP.',
    category: 'Defensive'
  },
  {
    name: 'Heavy-Duty Boots',
    description: 'Prevents the holder from being affected by entry hazards (Spikes, Stealth Rock, etc.).',
    category: 'Utility'
  },
  {
    name: 'Air Balloon',
    description: 'Makes the holder immune to Ground-type moves until it is hit by an attack.',
    category: 'Utility'
  },
  {
    name: 'Expert Belt',
    description: 'Boosts the power of super-effective moves by 20%.',
    category: 'Offensive'
  },
  {
    name: 'Eviolite',
    description: 'Boosts Defense and Sp. Def by 50% if the holder can still evolve.',
    category: 'Defensive'
  },
  {
    name: 'Black Sludge',
    description: 'Restores HP to Poison-types, but damages all other types.',
    category: 'Defensive'
  },
  {
    name: 'Safety Goggles',
    description: 'Protects the holder from powder-based moves and weather damage.',
    category: 'Utility'
  }
];
