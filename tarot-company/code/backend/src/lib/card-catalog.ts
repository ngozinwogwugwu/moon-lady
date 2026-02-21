// OMAR-008: Card catalog — static constant, never a DB query

export interface CardDefinition {
  card_id: string
  card_name: string
  card_type: 'Major' | 'Minor'
  domain: 'foundation' | 'motion' | 'interior' | 'relation' | 'threshold'
  coords: { S: number; C: number; X: number; O: number; L: number; A: number }
  image_anchor: string
}

export const CARD_CATALOG: CardDefinition[] = [
  // Foundation
  {
    card_id: 'the_emperor',
    card_name: 'The Emperor',
    card_type: 'Major',
    domain: 'foundation',
    coords: { S: 0.95, C: 0.70, X: -0.30, O: -0.20, L: 0.40, A: -0.50 },
    image_anchor: "the stone throne carved with ram's heads, the orb and scepter held firm",
  },
  {
    card_id: 'ten_of_pentacles',
    card_name: 'Ten of Pentacles',
    card_type: 'Minor',
    domain: 'foundation',
    coords: { S: 0.85, C: 0.80, X: 0.10, O: 0.40, L: 0.50, A: -0.30 },
    image_anchor:
      'the old man at the gate, his back to the viewer, two white dogs at his feet, the younger couple ahead',
  },
  {
    card_id: 'four_of_swords',
    card_name: 'Four of Swords',
    card_type: 'Minor',
    domain: 'foundation',
    coords: { S: 0.70, C: 0.60, X: -0.60, O: -0.50, L: 0.20, A: -0.80 },
    image_anchor: 'the stone effigy of a knight lying in repose, three swords mounted above, one beside',
  },
  // Motion
  {
    card_id: 'the_chariot',
    card_name: 'The Chariot',
    card_type: 'Major',
    domain: 'motion',
    coords: { S: 0.30, C: 0.20, X: 0.90, O: -0.10, L: 0.50, A: 0.95 },
    image_anchor: 'the two sphinxes — one dark, one light — standing still before the chariot, held by will alone',
  },
  {
    card_id: 'eight_of_wands',
    card_name: 'Eight of Wands',
    card_type: 'Minor',
    domain: 'motion',
    coords: { S: -0.10, C: -0.20, X: 0.85, O: 0.20, L: 0.30, A: 0.90 },
    image_anchor: 'eight wands crossing through open air in swift parallel flight, the valley floor far below',
  },
  {
    card_id: 'knight_of_swords',
    card_name: 'Knight of Swords',
    card_type: 'Minor',
    domain: 'motion',
    coords: { S: -0.30, C: -0.10, X: 0.70, O: -0.30, L: 0.60, A: 0.85 },
    image_anchor: 'the knight charging hard into the wind, sword raised, the trees bending behind him',
  },
  {
    card_id: 'page_of_cups',
    card_name: 'Page of Cups',
    card_type: 'Minor',
    domain: 'motion',
    coords: { S: 0.10, C: 0.30, X: 0.40, O: 0.50, L: -0.20, A: 0.40 },
    image_anchor: 'the page standing at the shore, holding up a cup from which a fish peers out',
  },
  // Interior
  {
    card_id: 'the_high_priestess',
    card_name: 'The High Priestess',
    card_type: 'Major',
    domain: 'interior',
    coords: { S: 0.20, C: 0.30, X: -0.90, O: -0.85, L: -0.60, A: -0.70 },
    image_anchor: 'the pomegranate veil behind her, the scroll half-visible in her lap',
  },
  {
    card_id: 'four_of_cups',
    card_name: 'Four of Cups',
    card_type: 'Minor',
    domain: 'interior',
    coords: { S: 0.40, C: 0.20, X: -0.70, O: -0.40, L: -0.50, A: -0.60 },
    image_anchor:
      "the figure seated at the oak's base, arms folded, three cups on the ground, a fourth extended from a cloud",
  },
  {
    card_id: 'seven_of_cups',
    card_name: 'Seven of Cups',
    card_type: 'Minor',
    domain: 'interior',
    coords: { S: -0.20, C: -0.30, X: -0.40, O: -0.50, L: -0.80, A: -0.20 },
    image_anchor:
      'the seven cups floating in cloud, each containing a different vision: a castle, a wreath, a serpent, a shrouded figure',
  },
  {
    card_id: 'the_moon',
    card_name: 'The Moon',
    card_type: 'Major',
    domain: 'interior',
    coords: { S: -0.30, C: -0.40, X: -0.50, O: -0.60, L: -0.90, A: -0.50 },
    image_anchor:
      "the crayfish emerging from the still pool at night, the two towers in the distance, the dog and wolf at the water's edge",
  },
  // Relation
  {
    card_id: 'the_lovers',
    card_name: 'The Lovers',
    card_type: 'Major',
    domain: 'relation',
    coords: { S: 0.40, C: 0.50, X: 0.20, O: 0.90, L: 0.10, A: 0.30 },
    image_anchor:
      'the angel spreading great wings above the man and woman, the serpent coiled in the fruit tree behind her',
  },
  {
    card_id: 'three_of_cups',
    card_name: 'Three of Cups',
    card_type: 'Minor',
    domain: 'relation',
    coords: { S: 0.50, C: 0.60, X: 0.30, O: 0.85, L: 0.40, A: 0.50 },
    image_anchor: 'three women raising their cups in a circle, flowers and harvest abundance at their feet',
  },
  {
    card_id: 'two_of_cups',
    card_name: 'Two of Cups',
    card_type: 'Minor',
    domain: 'relation',
    coords: { S: 0.60, C: 0.70, X: -0.10, O: 0.80, L: 0.30, A: 0.20 },
    image_anchor:
      "the man and woman facing each other, exchanging cups, the caduceus with lion's head rising between them",
  },
  {
    card_id: 'five_of_pentacles',
    card_name: 'Five of Pentacles',
    card_type: 'Minor',
    domain: 'relation',
    coords: { S: -0.50, C: -0.40, X: -0.20, O: 0.70, L: -0.30, A: -0.40 },
    image_anchor:
      'two figures walking through snow outside a lit stained-glass window, neither looking up at the warmth inside',
  },
  // Threshold
  {
    card_id: 'the_tower',
    card_name: 'The Tower',
    card_type: 'Major',
    domain: 'threshold',
    coords: { S: -0.80, C: -0.95, X: 0.30, O: 0.00, L: -0.40, A: 0.60 },
    image_anchor:
      "the jagged lightning bolt striking the tower's crown, two figures in mid-fall against the dark sky",
  },
  {
    card_id: 'five_of_cups',
    card_name: 'Five of Cups',
    card_type: 'Minor',
    domain: 'threshold',
    coords: { S: -0.60, C: -0.70, X: -0.30, O: 0.20, L: -0.50, A: -0.60 },
    image_anchor:
      'the figure in a black cloak standing before three spilled cups, two full cups standing upright behind',
  },
  {
    card_id: 'ten_of_swords',
    card_name: 'Ten of Swords',
    card_type: 'Minor',
    domain: 'threshold',
    coords: { S: -0.70, C: -0.80, X: -0.10, O: -0.10, L: -0.20, A: -0.70 },
    image_anchor:
      'the figure lying face-down with ten swords in the back, the calm water and the pale dawn on the horizon',
  },
]

// Lookup by card_id — used in stage-b-cache and stages
export const CARD_BY_ID = new Map(CARD_CATALOG.map((c) => [c.card_id, c]))
