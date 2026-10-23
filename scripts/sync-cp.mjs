// Pulls live problem-solving data. Run with: npm run sync:cp
// Codeforces and LeetCode come from their public APIs; the Codolio totals are a dated snapshot in src/data/cp.json.
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../src/data/cp.json', import.meta.url);
const data = JSON.parse(await readFile(file, 'utf8'));
const { codeforces: cfHandle, leetcode: lcUser } = data.handles;

try {
  const info = (await (await fetch(`https://codeforces.com/api/user.info?handles=${cfHandle}`)).json()).result[0];
  const history = (await (await fetch(`https://codeforces.com/api/user.rating?handle=${cfHandle}`)).json()).result;
  data.codeforces = {
    rating: info.rating, maxRating: info.maxRating, rank: info.rank, maxRank: info.maxRank, contests: history.length,
    history: history.map((c) => ({ rating: c.newRating, contest: c.contestName, rank: c.rank, at: c.ratingUpdateTimeSeconds * 1000 })),
  };
  console.log(`codeforces: ${info.rating}, ${history.length} contests`);
} catch (e) { console.warn(`codeforces skipped: ${e.message}`); }

try {
  const query = 'query($u:String!){userContestRanking(username:$u){rating attendedContestsCount topPercentage} matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}}}}';
  const res = await fetch('https://leetcode.com/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' }, body: JSON.stringify({ query, variables: { u: lcUser } }) });
  const d = (await res.json()).data;
  const solved = Object.fromEntries(d.matchedUser.submitStatsGlobal.acSubmissionNum.map((s) => [s.difficulty.toLowerCase(), s.count]));
  data.leetcode = { rating: Math.floor(d.userContestRanking.rating), contests: d.userContestRanking.attendedContestsCount, top: d.userContestRanking.topPercentage, solved };
  console.log(`leetcode: ${data.leetcode.rating}, ${solved.all} solved`);
} catch (e) { console.warn(`leetcode skipped: ${e.message}`); }

data.fetched = new Date().toISOString();
await writeFile(file, JSON.stringify(data, null, 2) + '\n');
