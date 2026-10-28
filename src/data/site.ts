export const site = {
  name: 'Aditya Raj',
  role: 'Software engineer',
  line: "Whether it's frontend, backend, full-stack or AI-powered, I work across the whole development lifecycle, from UI and UX to deployment to what users say afterwards. I care less about technology debates and more about shipping things people love using.",
  /** Your photo for the LinkedIn card, e.g. '/me.jpg' in /public. Falls back to the GitHub avatar. */
  photo: '',
  /** What the LinkedIn hover card shows. */
  linkedinCard: { name: 'K Aditya Raj Kumar Dora', headline: 'Software Engineer · Co-founder, Kalaa SkillTech', location: 'Bihar, India' },
  status: 'Open to SDE internships',
  email: 'me.adityaraj8@gmail.com',
  github: 'https://github.com/me-adityaraj8',
  linkedin: 'https://www.linkedin.com/in/aditya-raj-kumar-dora-44145b322',
  /** My Jake's-template resume, as a PDF in /public. Replace the file to update it. */
  resume: '/resume.pdf',
  /** Where the live time on the page comes from. */
  home: { timeZone: 'Asia/Kolkata' },
  /** Live weather in the footer, from Open-Meteo. */
  weather: { place: 'Bhagalpur', lat: 25.24, lon: 86.98 },
  /**
   * Live features. The visit count works as it is. "Here now" and the guestbook need the
   * worker in /worker deployed; set PUBLIC_LIVE_URL to its address and they switch on.
   */
  live: {
    backend: (import.meta.env.PUBLIC_LIVE_URL as string | undefined) ?? '',
    counter: 'https://abacus.jasoncameron.dev',
    counterKey: 'adityaraj-portfolio/visits',
  },
  /**
   * Direct messages from the site. FormSubmit forwards each one to this inbox; the very
   * first message triggers a one-time "activate this form" email that has to be confirmed.
   */
  messages: { endpoint: 'https://formsubmit.co/ajax/me.adityaraj8@gmail.com' },
  /** Public repos to keep off the site even though GitHub sync would list them. */
  hiddenRepos: ['parley'],
  /**
   * "Last played" reads from Last.fm, which collects plays from Spotify, YouTube Music
   * and Apple Music once each is connected to it. The card stays hidden until both are set.
   */
  lastfm: { user: '', apiKey: '' },
  /**
   * Until Last.fm is connected, the card rotates through these, one every 6 hours.
   * Placeholders: swap in your own songs. Artwork and previews are looked up automatically.
   */
  songs: [
    { title: 'cold/mess', artist: 'Prateek Kuhad' },
    { title: 'Choo Lo', artist: 'The Local Train' },
    { title: 'Udd Gaye', artist: 'Ritviz' },
    { title: 'Kho Gaye Hum Kahan', artist: 'Prateek Kuhad' },
    { title: 'Baarishein', artist: 'Anuv Jain' },
    { title: 'Blinding Lights', artist: 'The Weeknd' },
    { title: 'Yellow', artist: 'Coldplay' },
    { title: 'Sweater Weather', artist: 'The Neighbourhood' },
    { title: 'Perfect', artist: 'Ed Sheeran' },
    { title: 'Someone Like You', artist: 'Adele' },
    { title: 'Viva La Vida', artist: 'Coldplay' },
    { title: 'Starboy', artist: 'The Weeknd' },
    { title: 'Riptide', artist: 'Vance Joy' },
    { title: 'Mr. Brightside', artist: 'The Killers' },
    { title: 'Heat Waves', artist: 'Glass Animals' },
  ],
  education: [
    {
      school: 'IIIT Bhagalpur',
      logo: '/logos/iiit-bhagalpur.png',
      full: 'Indian Institute of Information Technology, Bhagalpur',
      detail: 'B.Tech, Computer Science and Engineering',
      years: '2024 – present',
      place: 'Bhagalpur, India',
      /** Sources: iiitbh.ac.in (About, Director's message) and its 2022-23 annual report. */
      note: 'An Institute of National Importance, set up in 2017 under the IIIT (PPP) Act. It is run jointly by the Government of India, the Government of Bihar and BELTRON, the state electronics corporation. IIT Guwahati mentors it, and it sits in Sabour, on the banks of the Ganga. I study Computer Science and Engineering here, from operating systems and networks to AI and soft computing.',
      /** From the semester timetables and the resume. `now` marks this semester's courses. */
      courses: [
        { name: 'Computer Networks', now: true },
        { name: 'Soft Computing', now: true },
        { name: 'Operating Systems', code: 'CS206' },
        { name: 'Database Management Systems', code: 'CS204' },
        { name: 'Formal Languages and Automata Theory', code: 'CS205' },
        { name: 'Artificial Intelligence', code: 'CS208' },
        { name: 'Microprocessors and Interfacing', code: 'EC208' },
        { name: 'Digital Signal Processing', code: 'EC223' },
        { name: 'Computer Organization and Architecture', code: 'CS207' },
        { name: 'Design and Analysis of Algorithms' },
        { name: 'Data Structures and Algorithms' },
        { name: 'Object-Oriented Programming' },
        { name: 'Web Technology' },
        { name: 'Computer Programming' },
      ] as Array<{ name: string; code?: string; now?: boolean }>,
    },
    {
      school: 'Arihant Public School',
      logo: '',
      full: 'Arihant Public School, Kota',
      detail: 'Class 12, 92%',
      years: '2023',
      place: 'Kota, Rajasthan',
      note: '',
      courses: [] as Array<{ name: string; code?: string; now?: boolean }>,
    },
  ],
  experience: [
    {
      org: 'Kalaa SkillTech',
      role: 'Co-founder',
      years: 'Mar 2025 – present',
      place: 'Bhagalpur, India',
      href: 'https://kalaa-website.vercel.app',
      shot: '/shots/kalaa-skilltech.webp',
      points: [
        'Co-founded a vocational learning startup that gives rural youth technical training and apprenticeships.',
        'Led frontend development and built the trainee registration and onboarding flow.',
        'Set up apprenticeship chains with local businesses for job-ready experience.',
        'Selected under Startup Bihar from more than 10,000 applicants for ₹10 lakh in seed funding.',
      ],
    },
  ],
  /** Shown in the stack section; the projects that use each one are worked out from the case studies. */
  stack: [
    { name: 'TypeScript', icon: 'siTypescript' },
    { name: 'JavaScript', icon: 'siJavascript' },
    { name: 'C++', icon: 'siCplusplus' },
    { name: 'React', icon: 'siReact' },
    { name: 'Next.js', icon: 'siNextdotjs' },
    { name: 'Node.js', icon: 'siNodedotjs' },
    { name: 'Express', icon: 'siExpress' },
    { name: 'PostgreSQL', icon: 'siPostgresql' },
    { name: 'Prisma', icon: 'siPrisma' },
    { name: 'MongoDB', icon: 'siMongodb' },
    { name: 'Tailwind', icon: 'siTailwindcss' },
    { name: 'GSAP', icon: 'siGsap' },
    { name: 'Zod', icon: 'siZod' },
    { name: 'Vitest', icon: 'siVitest' },
    { name: 'Astro', icon: 'siAstro' },
    { name: 'Git', icon: 'siGit' },
    { name: 'Vercel', icon: 'siVercel' },
  ],
};
