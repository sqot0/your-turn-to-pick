type HeroData = {
    id: number;
    localized_name: string;
    img: string;
};

type Pick_Bans = {
    is_pick: boolean;
    hero_id: number;
    team: number;
}

type MatchData = {
    radiant_win: boolean;
    match_id: number;
    game_mode: number;
    avg_rank_tier: number;
    radiant_team: number[];
    dire_team: number[];
    duration: number;
};

type MatchDetails = {
    radiant_score: number;
    dire_score: number;
    picks_bans: Pick_Bans[]
    duration: number;
};

export const getRandomMatch = async (): Promise<{
    radiantWin: boolean;
    rankAvg: number;
    radiantHeroes: HeroData[];
    direHeroes: HeroData[];
    radiantScore: number;
    direScore: number;
    matchId: number;
    duration: number;
    bannedHeroes: HeroData[];
}> => {
    const publicMatches: MatchData[] = await (await fetch(`https://api.opendota.com/api/publicMatches?min_rank=20`)).json();

    const filteredMatches = publicMatches.filter((match: MatchData) => match.game_mode === 22);

    if (filteredMatches.length === 0) {
        throw new Error("No matches with game_mode 22 found.");
    }

    const randomMatch = filteredMatches[Math.floor(Math.random() * filteredMatches.length)];
    const radiantWin: boolean = randomMatch.radiant_win;
    const randomMatchId: number = randomMatch.match_id;
    const rankAvg: number = randomMatch.avg_rank_tier;

    const radiantPick: number[] = randomMatch.radiant_team;
    const direPick: number[] = randomMatch.dire_team;

    const matchDetails: MatchDetails = await (await fetch(`https://api.opendota.com/api/matches/${randomMatchId}`)).json();

    const duration: number = matchDetails.duration;

    const radiantScore: number = matchDetails.radiant_score;
    const direScore: number = matchDetails.dire_score;

    const radiantTeam: number[] = [];
    const direTeam: number[] = [];
    const bannedList: number[] = [];

    matchDetails.picks_bans.map((pick: Pick_Bans) => {
        if (pick.is_pick === false || !(radiantPick.includes(pick.hero_id) || direPick.includes(pick.hero_id))) {
            bannedList.push(pick.hero_id)
        } else {
            if (pick.team === 0) {
                radiantTeam.push(pick.hero_id)
            } else {
                direTeam.push(pick.hero_id)
            }
        }
    })

    const heroesData: HeroData[] = await (await fetch("https://raw.githubusercontent.com/odota/dotaconstants/refs/heads/master/build/heroes.json")).json();

    const radiantHeroes: HeroData[] = [];
    const direHeroes: HeroData[] = [];
    const bannedHeroes: HeroData[] = [];

    radiantTeam.forEach((heroId: number) => {
        const hero = heroesData[heroId];
        if (hero) {
            radiantHeroes.push(hero);
        }
    });

    direTeam.forEach((heroId: number) => {
        const hero = heroesData[heroId];
        if (hero) {
            direHeroes.push(hero);
        }
    });

    bannedList.forEach((heroId: number) => {
        const hero = heroesData[heroId];
        if (hero) {
            bannedHeroes.push(hero);
        }
    });

    return {
        radiantWin: radiantWin,
        rankAvg: rankAvg,
        radiantHeroes: radiantHeroes,
        direHeroes: direHeroes,
        radiantScore: radiantScore,
        direScore: direScore,
        matchId: randomMatchId,
        duration: duration,
        bannedHeroes: bannedHeroes,
    } as const;
};