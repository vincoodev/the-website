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
            <style jsx global>{`
                .communityWrap {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 28px 18px 60px;
                }
                .communityHeader {
                    margin-bottom: 18px;
                }
                .communityTitle {
                    font-size: 40px;
                    line-height: 1.1;
                    margin: 0 0 8px;
                }
                .communitySubtitle {
                    margin: 0 0 16px;
                    opacity: 0.85;
                }
                .communityLink {
                    text-decoration: underline;
                }
                .communityControls {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    align-items: center;
                    margin: 12px 0;
                }
                .communitySearch {
                    flex: 1;
                    min-width: 240px;
                    padding: 10px 12px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(0, 0, 0, 0.18);
                    color: inherit;
                    outline: none;
                }
                .communitySearch:focus {
                    border-color: rgba(255, 255, 255, 0.28);
                }
                .communityFilters {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .communityChip {
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(0, 0, 0, 0.18);
                    color: inherit;
                    padding: 8px 10px;
                    border-radius: 999px;
                    cursor: pointer;
                    font-size: 14px;
                    user-select: none;
                    transition: transform 0.12s ease, border-color 0.12s ease,
                        background 0.12s ease;
                }
                .communityChip:hover {
                    transform: translateY(-1px);
                    border-color: rgba(255, 255, 255, 0.22);
                }
                .communityChip.isActive {
                    border-color: rgba(255, 255, 255, 0.35);
                    background: rgba(255, 255, 255, 0.06);
                }
                .communityStats {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-top: 10px;
                }
                .communityPill {
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(0, 0, 0, 0.18);
                    padding: 6px 10px;
                    border-radius: 999px;
                    font-size: 14px;
                }
                .communityState {
                    padding: 18px;
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(0, 0, 0, 0.18);
                }
                .communityState.error {
                    border-color: rgba(255, 120, 120, 0.35);
                }
                .communityHint {
                    margin-top: 8px;
                    opacity: 0.8;
                    font-size: 14px;
                }
                .communityGrid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 12px;
                    margin-top: 16px;
                }
                .contribCard {
                    grid-column: span 4;
                    display: block;
                    padding: 14px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(0, 0, 0, 0.18);
                    text-decoration: none;
                    color: inherit;
                    transition: transform 0.12s ease, border-color 0.12s ease,
                        background 0.12s ease;
                }
                .contribCard:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.28);
                    background: rgba(255, 255, 255, 0.04);
                }
                .contribTop {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .contribAvatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    object-fit: cover;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(255, 255, 255, 0.06);
                }
                .contribMeta {
                    min-width: 0;
                }
                .contribName {
                    font-weight: 800;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 100%;
                }
                .contribCount {
                    opacity: 0.8;
                    font-size: 14px;
                }
                .contribBadge {
                    margin-top: 12px;
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 650;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    background: rgba(255, 255, 255, 0.06);
                }

                .contribBadge.tone-first {
                    border-color: rgba(120, 220, 120, 0.4);
                }
                .contribBadge.tone-newbie {
                    border-color: rgba(120, 200, 160, 0.45);
                }
                .contribBadge.tone-resident {
                    border-color: rgba(120, 160, 255, 0.45);
                }
                .contribBadge.tone-fighter {
                    border-color: rgba(255, 120, 120, 0.45);
                }
                .contribBadge.tone-dewa {
                    border-color: rgba(255, 170, 80, 0.6);
                    box-shadow: 0 0 8px rgba(255, 170, 80, 0.35);
                }
                .contribBadge.tone-sepuh {
                    border-color: rgba(180, 140, 255, 0.6);
                    box-shadow: 0 0 10px rgba(180, 140, 255, 0.35);
                }
                .contribBadge.tone-sepuh-agung {
                    border-color: rgba(200, 160, 255, 0.8);
                    box-shadow: 0 0 12px rgba(200, 160, 255, 0.6),
                        0 0 24px rgba(200, 160, 255, 0.35);
                    animation: pulseGlow 2.2s ease-in-out infinite;
                }

                @keyframes pulseGlow {
                    0% {
                        box-shadow: 0 0 10px rgba(200, 160, 255, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 22px rgba(200, 160, 255, 0.8);
                    }
                    100% {
                        box-shadow: 0 0 10px rgba(200, 160, 255, 0.4);
                    }
                }
                @media (max-width: 900px) {
                    .contribCard {
                        grid-column: span 6;
                    }
                }
                @media (max-width: 520px) {
                    .contribCard {
                        grid-column: span 12;
                    }
                }
                @media (max-width: 768px) {
                    .communityFilters {
                        flex-wrap: nowrap;
                        overflow-x: auto;
                        overflow-y: hidden;
                        -webkit-overflow-scrolling: touch;
                        padding-bottom: 6px;
                        scrollbar-width: none;
                    }
                    .communityFilters::-webkit-scrollbar {
                        display: none;
                    }
                    .communityChip {
                        flex: 0 0 auto;
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
}
