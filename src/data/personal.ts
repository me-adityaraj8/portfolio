/**
 * The personal page at /personal, in my own words.
 *
 * - Posters and song covers are downloaded by `npm run sync:personal` into src/assets,
 *   so the page never depends on another site at runtime. A title without a poster
 *   (Dark has none available) gets a typographic card instead.
 * - Photos go in src/assets/photos as jpg, png or webp. They appear in name order, and
 *   the name becomes the caption: "03-golden-hour.jpg" is shown as "Golden hour".
 */

export interface Title {
  id: string;
  title: string;
  kind: 'Film' | 'Series';
  year: string;
  by: string;
  length: string;
  genre: string;
  /** One line, no spoilers. */
  premise: string;
  /** Wikipedia page whose lead image is the poster. */
  wiki?: string;
  tone: [string, string];
}

export interface Song { title: string; artist: string }

export const personal = {
  intro: "My interests don't follow a roadmap, and neither does this page.",
  outro: 'Consider this a work in progress, much like literally everything else.',

  movies: {
    title: 'Movies, Shows & Losing the Plot',
    body: [
      "Psychological thrillers, mind-bending sci-fi, horror, dark plots, and characters who desperately need therapy. Basically, if the ending makes me stare at the screen for 10 minutes, I'm sold. I will overanalyze the plot, read fan theories, and probably still miss something obvious.",
      'Horror movies get a separate pass because apparently I enjoy being scared for fun.',
    ],
    titles: [
      { id: 'fight-club', title: 'Fight Club', kind: 'Film', year: '1999', by: 'David Fincher', length: '2h 19m', genre: 'Psychological thriller', wiki: 'Fight_Club', tone: ['#f472b6', '#7c2d12'],
        premise: 'An insomniac office worker meets a soap salesman, and the underground fight club they start turns into something much bigger.' },
      { id: 'shutter-island', title: 'Shutter Island', kind: 'Film', year: '2010', by: 'Martin Scorsese', length: '2h 18m', genre: 'Psychological thriller', wiki: 'Shutter_Island_(film)', tone: ['#94a3b8', '#0f172a'],
        premise: 'Two U.S. marshals search for a patient who vanished from a hospital for the criminally insane on a remote island.' },
      { id: 'interstellar', title: 'Interstellar', kind: 'Film', year: '2014', by: 'Christopher Nolan', length: '2h 49m', genre: 'Science fiction', wiki: 'Interstellar_(film)', tone: ['#fbbf24', '#0c0a09'],
        premise: 'With Earth dying, a former pilot leads a mission through a wormhole to find a new home, while time runs differently for the family he left.' },
      { id: 'inception', title: 'Inception', kind: 'Film', year: '2010', by: 'Christopher Nolan', length: '2h 28m', genre: 'Science fiction heist', wiki: 'Inception', tone: ['#38bdf8', '#082f49'],
        premise: 'A thief who steals secrets from inside dreams is hired for the opposite job: planting an idea in someone\'s mind.' },
      { id: 'black-swan', title: 'Black Swan', kind: 'Film', year: '2010', by: 'Darren Aronofsky', length: '1h 48m', genre: 'Psychological horror', wiki: 'Black_Swan_(film)', tone: ['#f4f4f5', '#18181b'],
        premise: 'A ballerina chasing the lead role in Swan Lake slowly loses her grip on what is real.' },
      { id: 'dark', title: 'Dark', kind: 'Series', year: '2017–2020', by: 'Baran bo Odar and Jantje Friese', length: '3 seasons', genre: 'Science fiction mystery', tone: ['#fde68a', '#1c1917'],
        premise: 'Children go missing in a small German town, and four families find their pasts, presents and futures knotted together across time.' },
      { id: 'breaking-bad', title: 'Breaking Bad', kind: 'Series', year: '2008–2013', by: 'Vince Gilligan', length: '5 seasons', genre: 'Crime drama', wiki: 'Breaking_Bad_season_1', tone: ['#a3e635', '#14532d'],
        premise: 'A chemistry teacher with a terminal diagnosis starts cooking meth to provide for his family, and turns into someone else entirely.' },
      { id: 'better-call-saul', title: 'Better Call Saul', kind: 'Series', year: '2015–2022', by: 'Vince Gilligan and Peter Gould', length: '6 seasons', genre: 'Crime drama', wiki: 'Better_Call_Saul_season_1', tone: ['#facc15', '#7f1d1d'],
        premise: 'Small-time lawyer Jimmy McGill, and the long, slow slide that turns him into Saul Goodman.' },
      { id: 'the-sopranos', title: 'The Sopranos', kind: 'Series', year: '1999–2007', by: 'David Chase', length: '6 seasons', genre: 'Crime drama', wiki: 'The_Sopranos_season_1', tone: ['#ef4444', '#0a0a0a'],
        premise: 'A New Jersey mob boss starts seeing a psychiatrist while juggling his family and his other family.' },
    ] as Title[],
  },

  music: {
    title: 'Music & Random Frequencies',
    body: ["My music taste is all over the place, I like it that way. One minute it's smooth jazz, the next minute I'm floating in some synth-heavy alternate universe. No genre loyalty here, just vibes."],
    genres: ['Retro jazz', 'R&B', 'Acid jazz', 'Synth', 'Cloud rap', 'Nu-disco', 'Bollywood, occasionally'],
    /** Songs with a 30-second preview each. Run `npm run sync:personal` after changing them. */
    songs: [
      { title: 'What a Wonderful World', artist: 'Louis Armstrong' },
      { title: 'So What', artist: 'Miles Davis' },
      { title: 'Take Five', artist: 'The Dave Brubeck Quartet' },
      { title: 'Redbone', artist: 'Childish Gambino' },
      { title: 'Leave the Door Open', artist: 'Silk Sonic' },
      { title: 'Tadow', artist: 'FKJ & Masego' },
      { title: 'L$D', artist: 'A$AP Rocky' },
      { title: 'Location', artist: 'Playboi Carti' },
      { title: 'Kyoto', artist: 'Yung Lean' },
      { title: 'Get Lucky', artist: 'Daft Punk' },
      { title: "Don't Start Now", artist: 'Dua Lipa' },
      { title: 'Lady (Hear Me Tonight)', artist: 'Modjo' },
    ] as Song[],
  },

  singing: {
    title: 'Singing, Just Because',
    quote: 'No special occasion needed, no audience required.',
    body: ["I love singing. Sometimes it's about getting a song just right, sometimes it's just me, my headphones, and a song on repeat. If I like a song enough, there's a good chance I'll try singing it too."],
  },

  sports: {
    title: 'Sports & Sweat',
    body: ["Gym sessions, bodybuilding competitions, the occasional cricket match, and badminton rallies that I take a little too seriously. I'm into the discipline of lifting, the thrill of competition, and the satisfaction of getting better at something. Badminton is probably where my competitive side shows up the most."],
  },

  cooking: {
    title: 'Cooking > Ordering In',
    body: ['I LOVE cooking. Trying recipes, messing around with spices, and making something ridiculously good out of random ingredients is my kind of fun. Give me a kitchen and some time, and ordering food might just become a very unnecessary expense.'],
    favourite: { name: 'Biryani', note: 'My all-time favourite food. To cook, and even more to eat.' },
    also: ['Butter chicken'],
  },

  photography: {
    title: 'Photography & Random Things That Look Cool',
    body: ['I take photos, collect interesting visuals, and occasionally see something and think, "wait, that would make a sick picture." Still exploring this whole photography thing, so expect more experiments, random frames, and probably too many pictures of things that caught my eye.'],
  },

  reading: {
    title: 'Self-Help & Other Attempts at Getting My Life Together',
    quote: 'Spoiler: still working on it.',
    body: ["Mostly self-help and personal development books. Apparently, I believe the next book might finally unlock the secret to having my life completely figured out. But hey, picking up a useful idea here and there can't hurt."],
  },

  coding: {
    title: 'Coding Things Into Existence',
    body: ["I get an idea, convince myself it'll be a quick project, open my laptop, and suddenly it's 3 AM and I'm debugging something completely unrelated. Websites, AI experiments, random tools, ambitious side projects: if it sounds interesting enough, I probably want to build it. Whether I finish it before getting another idea is a different story."],
  },

  side: {
    title: 'Side Quests',
    list: ['Gardening', 'Travelling', 'Socialising'],
    body: ["And whatever else catches my attention next. I'll keep adding things as I go."],
  },
};

export const hasPersonal = true;
