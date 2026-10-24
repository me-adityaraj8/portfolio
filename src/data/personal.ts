/**
 * The personal page at /personal. Fill in your own picks; a group with no items stays
 * hidden, and the footer link appears once any group has something in it.
 * `note` is optional: a line on why, shown under the name.
 */
export interface Pick { name: string; note?: string }
export interface Group { title: string; blurb: string; tone: [string, string]; items: Pick[] }

export const personal = {
  intro: 'What I do when I am not shipping something.',
  groups: [
    { title: 'Music', blurb: 'On repeat lately', tone: ['#f472b6', '#c084fc'], items: [] },
    { title: 'Sports', blurb: 'Playing and watching', tone: ['#34d399', '#22d3ee'], items: [] },
    { title: 'Movies and shows', blurb: 'Watched more than once', tone: ['#fbbf24', '#f97316'], items: [] },
    { title: 'Books', blurb: 'Worth the time', tone: ['#818cf8', '#38bdf8'], items: [] },
    { title: 'Also into', blurb: 'Everything else', tone: ['#a78bfa', '#f472b6'], items: [] },
  ] as Group[],
};

export const hasPersonal = personal.groups.some((g) => g.items.length > 0);
