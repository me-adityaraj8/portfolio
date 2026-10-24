/**
 * The personal page at /personal, in my own words. Each group's `id` picks the visual
 * drawn for it on the page; `tags` are the named favourites. Photos for the photography
 * strip go in src/assets/photos (any jpg, png or webp), and appear in name order.
 */
export interface Group { id: string; title: string; body: string[]; tags?: string[]; tone: [string, string] }

export const personal = {
  intro: "What I'm into when I'm not shipping something. Consider it a work in progress, much like literally everything else.",
  groups: [
    {
      id: 'movies',
      title: 'Movies, Shows & Losing the Plot',
      tone: ['#f43f5e', '#a855f7'],
      body: [
        "Psychological thrillers, mind-bending sci-fi, horror, dark plots, and characters who desperately need therapy. Basically, if the ending makes me stare at the screen for 10 minutes, I'm sold. I will overanalyze the plot, read fan theories, and probably still miss something obvious.",
        'Horror movies get a separate pass because apparently I enjoy being scared for fun.',
      ],
      tags: ['Fight Club', 'Shutter Island', 'Interstellar', 'Inception', 'Black Swan', 'Dark', 'Breaking Bad', 'Better Call Saul', 'The Sopranos'],
    },
    {
      id: 'music',
      title: 'Music & Random Frequencies',
      tone: ['#f472b6', '#c084fc'],
      body: [
        'My music taste is all over the place, and honestly, I like it that way. One minute it\'s smooth jazz, the next minute I\'m floating in some synth-heavy alternate universe. No genre loyalty here, just vibes.',
      ],
      tags: ['Retro jazz', 'R&B', 'Acid jazz', 'Synth', 'Cloud rap', 'Nu-disco', 'Bollywood, occasionally'],
    },
    {
      id: 'singing',
      title: 'Singing, Just Because',
      tone: ['#fb923c', '#f472b6'],
      body: [
        "I love singing. Sometimes it's about getting a song just right, sometimes it's just me, my headphones, and a song on repeat. No special occasion needed, no audience required. If I like a song enough, there's a good chance I'll try singing it too. Bonus points if there's a guitar involved.",
      ],
    },
    {
      id: 'sports',
      title: 'Sports & Sweat',
      tone: ['#34d399', '#22d3ee'],
      body: [
        "Gym sessions, bodybuilding competitions, the occasional cricket match, and badminton rallies that I take a little too seriously. I'm into the discipline of lifting, the thrill of competition, and the satisfaction of getting better at something. Badminton is probably where my competitive side shows up the most.",
      ],
      tags: ['Gym', 'Bodybuilding', 'Badminton', 'Cricket'],
    },
    {
      id: 'cooking',
      title: 'Cooking > Ordering In',
      tone: ['#fbbf24', '#f97316'],
      body: [
        'I LOVE cooking. Trying recipes, messing around with spices, and making something ridiculously good out of random ingredients is my kind of fun. Give me a kitchen and some time, and ordering food might just become a very unnecessary expense.',
      ],
      tags: ['Biryani', 'Butter chicken'],
    },
    {
      id: 'books',
      title: 'Self-Help & Other Attempts at Getting My Life Together',
      tone: ['#818cf8', '#38bdf8'],
      body: [
        'Mostly self-help and personal development books. Apparently, I believe the next book might finally unlock the secret to having my life completely figured out. Spoiler: still working on it. But hey, picking up a useful idea here and there can\'t hurt.',
      ],
    },
    {
      id: 'photography',
      title: 'Photography & Random Things That Look Cool',
      tone: ['#2dd4bf', '#818cf8'],
      body: [
        'I take photos, collect interesting visuals, and occasionally see something and think, "wait, that would make a sick picture." Still exploring this whole photography thing, so expect more experiments, random frames, and probably too many pictures of things that caught my eye.',
      ],
    },
    {
      id: 'coding',
      title: 'Coding Things Into Existence',
      tone: ['#a78bfa', '#22d3ee'],
      body: [
        "I get an idea, convince myself it'll be a quick project, open my laptop, and suddenly it's 3 AM and I'm debugging something completely unrelated. Websites, AI experiments, random tools, ambitious side projects: if it sounds interesting enough, I probably want to build it. Whether I finish it before getting another idea is a different story.",
      ],
    },
    {
      id: 'side',
      title: 'Side Quests',
      tone: ['#facc15', '#34d399'],
      body: [
        "Football, guitar, and whatever else catches my attention next. My interests don't follow a roadmap, and neither does this section. I'll keep adding things as I go.",
      ],
      tags: ['Football', 'Guitar'],
    },
  ] as Group[],
};

export const hasPersonal = personal.groups.length > 0;
