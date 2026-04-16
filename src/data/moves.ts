import { PokemonType } from './type-chart';

export interface Move {
  name: string;
  type: PokemonType;
}

export const MOVES: Move[] = [
  { name: 'Body Slam', type: PokemonType.Normal },
  { name: 'Double Edge', type: PokemonType.Normal },
  { name: 'Hyper Voice', type: PokemonType.Normal },
  { name: 'Extreme Speed', type: PokemonType.Normal },
  { name: 'Facade', type: PokemonType.Normal },

  { name: 'Fire Blast', type: PokemonType.Fire },
  { name: 'Flamethrower', type: PokemonType.Fire },
  { name: 'Flare Blitz', type: PokemonType.Fire },
  { name: 'Overheat', type: PokemonType.Fire },
  { name: 'Heat Wave', type: PokemonType.Fire },

  { name: 'Hydro Pump', type: PokemonType.Water },
  { name: 'Surf', type: PokemonType.Water },
  { name: 'Liquidation', type: PokemonType.Water },
  { name: 'Scald', type: PokemonType.Water },
  { name: 'Aqua Tail', type: PokemonType.Water },

  { name: 'Thunderbolt', type: PokemonType.Electric },
  { name: 'Thunder', type: PokemonType.Electric },
  { name: 'Wild Charge', type: PokemonType.Electric },
  { name: 'Volt Switch', type: PokemonType.Electric },
  { name: 'Thunder Punch', type: PokemonType.Electric },

  { name: 'Leaf Storm', type: PokemonType.Grass },
  { name: 'Energy Ball', type: PokemonType.Grass },
  { name: 'Power Whip', type: PokemonType.Grass },
  { name: 'Seed Bomb', type: PokemonType.Grass },
  { name: 'Giga Drain', type: PokemonType.Grass },

  { name: 'Ice Beam', type: PokemonType.Ice },
  { name: 'Blizzard', type: PokemonType.Ice },
  { name: 'Icicle Crash', type: PokemonType.Ice },
  { name: 'Ice Punch', type: PokemonType.Ice },
  { name: 'Freeze-Dry', type: PokemonType.Ice },

  { name: 'Close Combat', type: PokemonType.Fighting },
  { name: 'Focus Blast', type: PokemonType.Fighting },
  { name: 'High Jump Kick', type: PokemonType.Fighting },
  { name: 'Aura Sphere', type: PokemonType.Fighting },
  { name: 'Drain Punch', type: PokemonType.Fighting },

  { name: 'Sludge Bomb', type: PokemonType.Poison },
  { name: 'Gunk Shot', type: PokemonType.Poison },
  { name: 'Poison Jab', type: PokemonType.Poison },
  { name: 'Sludge Wave', type: PokemonType.Poison },
  { name: 'Venoshock', type: PokemonType.Poison },

  { name: 'Earthquake', type: PokemonType.Ground },
  { name: 'Earth Power', type: PokemonType.Ground },
  { name: 'High Horsepower', type: PokemonType.Ground },
  { name: 'Scorching Sands', type: PokemonType.Ground },
  { name: 'Stomping Tantrum', type: PokemonType.Ground },

  { name: 'Hurricane', type: PokemonType.Flying },
  { name: 'Air Slash', type: PokemonType.Flying },
  { name: 'Brave Bird', type: PokemonType.Flying },
  { name: 'Acrobatics', type: PokemonType.Flying },
  { name: 'Sky Attack', type: PokemonType.Flying },

  { name: 'Psychic', type: PokemonType.Psychic },
  { name: 'Psyshock', type: PokemonType.Psychic },
  { name: 'Zen Headbutt', type: PokemonType.Psychic },
  { name: 'Photon Geyser', type: PokemonType.Psychic },
  { name: 'Expanding Force', type: PokemonType.Psychic },

  { name: 'Bug Buzz', type: PokemonType.Bug },
  { name: 'Megahorn', type: PokemonType.Bug },
  { name: 'U-turn', type: PokemonType.Bug },
  { name: 'Lunge', type: PokemonType.Bug },
  { name: 'First Impression', type: PokemonType.Bug },

  { name: 'Stone Edge', type: PokemonType.Rock },
  { name: 'Rock Slide', type: PokemonType.Rock },
  { name: 'Power Gem', type: PokemonType.Rock },
  { name: 'Meteor Beam', type: PokemonType.Rock },
  { name: 'Rock Tomb', type: PokemonType.Rock },

  { name: 'Shadow Ball', type: PokemonType.Ghost },
  { name: 'Shadow Claw', type: PokemonType.Ghost },
  { name: 'Poltergeist', type: PokemonType.Ghost },
  { name: 'Hex', type: PokemonType.Ghost },
  { name: 'Phantom Force', type: PokemonType.Ghost },

  { name: 'Draco Meteor', type: PokemonType.Dragon },
  { name: 'Dragon Pulse', type: PokemonType.Dragon },
  { name: 'Outrage', type: PokemonType.Dragon },
  { name: 'Dragon Claw', type: PokemonType.Dragon },
  { name: 'Scale Shot', type: PokemonType.Dragon },

  { name: 'Dark Pulse', type: PokemonType.Dark },
  { name: 'Crunch', type: PokemonType.Dark },
  { name: 'Knock Off', type: PokemonType.Dark },
  { name: 'Sucker Punch', type: PokemonType.Dark },
  { name: 'Lash Out', type: PokemonType.Dark },

  { name: 'Flash Cannon', type: PokemonType.Steel },
  { name: 'Iron Head', type: PokemonType.Steel },
  { name: 'Meteor Mash', type: PokemonType.Steel },
  { name: 'Heavy Slam', type: PokemonType.Steel },
  { name: 'Steel Beam', type: PokemonType.Steel },

  { name: 'Moonblast', type: PokemonType.Fairy },
  { name: 'Dazzling Gleam', type: PokemonType.Fairy },
  { name: 'Play Rough', type: PokemonType.Fairy },
  { name: 'Spirit Break', type: PokemonType.Fairy },
  { name: 'Strange Steam', type: PokemonType.Fairy },
];
