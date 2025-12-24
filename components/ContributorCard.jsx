function getBadge(contributions) {
    const n = Number(contributions || 0);

    if (n >= 200)
        return {
            label: "🧙‍♂️ SEPUH AGUNG",
            tone: "sepuh-agung",
            desc: "Repo ini mungkin dia yang jagain dari awal",
        };

    if (n >= 100)
        return {
            label: "👑 SEPUH",
            tone: "sepuh",
            desc: "Senior open source, jarang muncul tapi sakti",
        };

    if (n >= 50)
        return {
            label: "🔥 DEWA KOMIT",
            tone: "dewa",
            desc: "Commit jalan terus, tanpa banyak bacot",
        };

    if (n >= 25)
        return {
            label: "⚔️ PEJUANG PR",
            tone: "fighter",
            desc: "Datang, kirim PR, hilang, datang lagi",
        };

    if (n >= 10)
        return {
            label: "🧠 WARGA TETAP",
            tone: "resident",
            desc: "Udah betah nongkrong di repo ini",
        };

    if (n >= 3)
        return {
            label: "🌱 PENDAKIAN PERTAMA",
            tone: "newbie",
            desc: "Baru mulai kontribusi, lanjutkan!",
        };

    return {
        label: "🟢 BARU NYEMPLUNG",
        tone: "first",
        desc: "First PR vibes, welcome to chaos",
    };
}

export default function ContributorCard({ contributor }) {
    const login = contributor?.login || "unknown";
    const avatar = contributor?.avatar_url;
    const url = contributor?.html_url || `https://github.com/${login}`;
    const contributions = Number(contributor?.contributions || 0);

    const badge = getBadge(contributions);

    return (
        <a
            className="contribCard"
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open GitHub profile of ${login}`}
        >
            <div className="contribTop">
                <img className="contribAvatar" src={avatar} alt={`${login} avatar`} />

                <div className="contribMeta">
                    <div className="contribName">@{login}</div>
                    <div className="contribCount">{contributions} contributions</div>
                </div>
            </div>

            <div
                className={`contribBadge tone-${badge.tone}`}
                title={badge.desc}
                aria-label={badge.desc}
            >
                {badge.label}
            </div>
        </a>
    );
}
