export type RewardType = "cafe" | "link" | "text";

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  content: string; // address for cafe, url for link, text for text
  url?: string; // google maps url for cafe
  lat?: number; // latitude for map
  lng?: number; // longitude for map
  assignedTaskId?: string; // null if not assigned
  pokemonId: number; // The pokemon representing this reward
}

export interface CustomTag {
  text: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  deadline?: string; // ISO date string
  subtasks: Subtask[];
  pokemonId: number; // Pokemon attached to it
  rewardId: string; // ID of the reward unlocking
  createdAt: string;
  tags?: (string | CustomTag)[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export const INITIAL_CAFE_REWARDS: Omit<reward, "id"="" |="" "assignedtaskid"="">[] = [
  {
    type: "cafe",
    name: "Cupping Room Coffee Roasters",
    content: "18 Cochrane St, Central",
    url: "https://maps.app.goo.gl/9uRRErQpM7Rz2m5m9",
    lat: 22.2829,
    lng: 114.155,
    pokemonId: 1, // Bulbasaur
  },
  {
    type: "cafe",
    name: "Halfway Coffee",
    content: "26 Upper Lascar Row, Central",
    url: "https://maps.app.goo.gl/7N1G26Bv1sU5Z3Vq7",
    lat: 22.2844,
    lng: 114.1498,
    pokemonId: 4, // Charmander
  },
  {
    type: "cafe",
    name: "NOC Coffee Co.",
    content: "34 Gough St, Central",
    url: "https://maps.app.goo.gl/o1H4gY8hU7uW6sZ86",
    lat: 22.2841,
    lng: 114.1524,
    pokemonId: 7, // Squirtle
  },
  {
    type: "cafe",
    name: "Fineprint",
    content: "38 Peel St, Central",
    url: "https://maps.app.goo.gl/z2u5R9n6e6aG7aL88",
    lat: 22.2825,
    lng: 114.1526,
    pokemonId: 25, // Pikachu
  },
  {
    type: "cafe",
    name: "Hazel & Hershey Coffee Roasters",
    content: "71 Peel St, Central",
    url: "https://maps.app.goo.gl/X9Y1J2x3k4z5P6o79",
    lat: 22.2822,
    lng: 114.1521,
    pokemonId: 39, // Jigglypuff
  },
  {
    type: "cafe",
    name: "Bakehouse",
    content: "14 Tai Wong St E, Wan Chai (Near Central)",
    url: "https://maps.app.goo.gl/M5P7y8Z4w3x2Q1o66",
    lat: 22.2745,
    lng: 114.1705,
    pokemonId: 133, // Eevee
  },
  {
    type: "cafe",
    name: "Winstons Coffee",
    content: "213 Queen's Rd W, Sai Ying Pun",
    url: "https://maps.app.goo.gl/Q9X5J1z8k9Q6w5o47",
    lat: 22.2868,
    lng: 114.1422,
    pokemonId: 143, // Snorlax
  },
  {
    type: "cafe",
    name: "The Espresso Room",
    content: "Shop G03, G/F, The Center, 99 Queen's Road Central",
    url: "https://maps.google.com/?q=The+Espresso+Room+Central+HK",
    lat: 22.2845,
    lng: 114.1554,
    pokemonId: 54, // Psyduck
  },
];
