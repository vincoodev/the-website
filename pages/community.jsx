import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ContributorCard from "../components/ContributorCard";

const OWNER = "vincoodev";
const REPO = "the-website";
const PER_PAGE = 100;

export default function CommunityPage() {
    const [contributors, setContributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        let aborted = false;

        async function loadContributors() {
            try {
                setLoading(true);
                setErr("");

                const url = `https://api.github.com/repos/${OWNER}/${REPO}/contributors?per_page=${PER_PAGE}`;
                const res = await fetch(url, {
                    headers: { Accept: "application/vnd.github+json" },
                });

                if (!res.ok) {
                    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
                }

                const data = await res.json();
                if (!aborted) setContributors(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!aborted)
                    setErr(e?.message || "Failed to load contributors from GitHub.");
            } finally {
                if (!aborted) setLoading(false);
            }
        }

        loadContributors();
        return () => {
            aborted = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        const bySearch = contributors.filter((c) => {
            if (!q) return true;
            return (c?.login || "").toLowerCase().includes(q);
        });

        const byRole = bySearch.filter((c) => {
            const n = Number(c?.contributions || 0);

            switch (filter) {
                case "nyemplung":
                    return n < 3;
                case "newbie":
                    return n >= 3 && n < 10;
                case "resident":
                    return n >= 10 && n < 25;
                case "fighter":
                    return n >= 25 && n < 50;
                case "dewa":
                    return n >= 50 && n < 100;
                case "sepuh":
                    return n >= 100 && n < 200;
                case "sepuh-agung":
                    return n >= 200;
                default:
                    return true;
            }
        });

        return byRole;
    }, [contributors, search, filter]);

    return (
        <div className="communityWrap">
            <header className="communityHeader">
                <h1 className="communityTitle">Community</h1>

                <p className="communitySubtitle">
                    Real contributors from{" "}
                    <a
                        className="communityLink"
                        href={`https://github.com/${OWNER}/${REPO}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {OWNER}/{REPO}
                    </a>
                    . Thank you for helping build this chaos. 😈
                </p>

                <div className="communityControls">
                    <input
                        className="communitySearch"
                        type="text"
                        placeholder="Search username…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search contributors"
                    />

                    <div
                        className="communityFilters"
                        role="tablist"
                        aria-label="Filter contributors"
                    >
                        <button
                            className={`communityChip ${filter === "all" ? "isActive" : ""}`}
                            onClick={() => setFilter("all")}
                            type="button"
                        >
                            All
                        </button>

                        <button
                            className={`communityChip ${filter === "nyemplung" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("nyemplung")}
                            type="button"
                            title="0-2 contributions"
                        >
                            🟢 Baru Nyemplung
                        </button>

                        <button
                            className={`communityChip ${filter === "newbie" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("newbie")}
                            type="button"
                            title="3-9 contributions"
                        >
                            🌱 Pendakian Pertama
                        </button>

                        <button
                            className={`communityChip ${filter === "resident" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("resident")}
                            type="button"
                            title="10-24 contributions"
                        >
                            🧠 Warga Tetap
                        </button>

                        <button
                            className={`communityChip ${filter === "fighter" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("fighter")}
                            type="button"
                            title="25-49 contributions"
                        >
                            ⚔️ Pejuang PR
                        </button>

                        <button
                            className={`communityChip ${filter === "dewa" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("dewa")}
                            type="button"
                            title="50-99 contributions"
                        >
                            🔥 Dewa Komit
                        </button>

                        <button
                            className={`communityChip ${filter === "sepuh" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("sepuh")}
                            type="button"
                            title="100-199 contributions"
                        >
                            👑 Sepuh
                        </button>

                        <button
                            className={`communityChip ${filter === "sepuh-agung" ? "isActive" : ""
                                }`}
                            onClick={() => setFilter("sepuh-agung")}
                            type="button"
                            title="≥ 200 contributions"
                        >
                            🧙‍♂️ Sepuh Agung
                        </button>
                    </div>
                </div>

                <div className="communityStats">
                    <span className="communityPill">
                        Total: <b>{contributors.length}</b>
                    </span>
                    <span className="communityPill">
                        Showing: <b>{filtered.length}</b>
                    </span>
                </div>
            </header>

            {loading ? (
                <div className="communityState">Loading contributors…</div>
            ) : err ? (
                <div className="communityState error">
                    <b>Oops:</b> {err}
                    <div className="communityHint">
                        Kalau kena rate limit GitHub (403), tunggu sebentar lalu refresh.
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="communityState">
                    Tidak ada hasil. Coba kata kunci lain / ubah filter.
                </div>
            ) : (
                <div className="communityGrid">
                    {filtered.map((c) => (
                        <ContributorCard key={c.id || c.login} contributor={c} />
                    ))}
                </div>
            )}
        </div>
    );
}
