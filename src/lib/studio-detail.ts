import { formatMoney, type Studio } from "@/lib/api";

/* ------------------------------- Review type ------------------------------ */

export type Review = {
    id: string;
    name: string;
    date: string;
    rating: number;
    text: string;
};

/* --------------------------------- Helpers -------------------------------- */

function hash(str: string): number {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    }
    return h;
}

function monthYear(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Recently";
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function round1(n: number): number {
    return Math.min(5, Math.round(n * 10) / 10);
}

/* --------------------------------- Gallery -------------------------------- */

const PHOTO_POOL = [
    "/images/slide-1.jpg",
    "/images/slide-2.jpg",
    "/images/slide-3.jpg",
    "/images/medium-photo.jpg",
    "/images/medium-film.jpg",
    "/images/medium-art.jpg",
    "/images/medium-music.jpg",
    "/images/medium-podcast.jpg",
    "/images/hosts.jpg",
];

/** The API stores a single cover image; pad it into a carousel of up to 8 photos. */
export function buildGallery(studio: Studio): string[] {
    const seed = hash(studio.id);
    const picks: string[] = [];
    for (let i = 0; i < 7; i++) {
        picks.push(PHOTO_POOL[(seed + i * 5) % PHOTO_POOL.length]);
    }
    return [studio.imageUrl, ...picks]
        .filter((src, i, arr) => src && arr.indexOf(src) === i)
        .slice(0, 8);
}

/* --------------------------------- Reviews -------------------------------- */

const REVIEW_POOL: Omit<Review, "id">[] = [
    {
        name: "Lena Brooks",
        date: "October 18, 2026",
        rating: 5,
        text: "The light is unreal. We shot a full lookbook in four hours and barely touched our lighting kit. The host made everything effortless.",
    },
    {
        name: "Sam Okafor",
        date: "October 6, 2026",
        rating: 5,
        text: "Exactly as pictured, and even more spacious in person. Quiet enough for our interview shoot. Already planning our next booking.",
    },
    {
        name: "Priya Raman",
        date: "September 27, 2026",
        rating: 5,
        text: "Booked it for a two-day brand campaign. Load-in was painless, the crew loved the space, and check-out was just as easy as check-in.",
    },
    {
        name: "Diego Marín",
        date: "September 12, 2026",
        rating: 4,
        text: "Great space with tons of character. The only minor note is that afternoons get warm, but the host sent a portable unit right away.",
    },
    {
        name: "Hannah Kim",
        date: "August 30, 2026",
        rating: 5,
        text: "The host answered every question within minutes and had suggestions for nearby parking and catering. Truly a five-star experience.",
    },
    {
        name: "Tomás Alvarez",
        date: "August 14, 2026",
        rating: 5,
        text: "We ran a small creative workshop here for ten people. Comfortable, inspiring, and everyone asked where we found the space.",
    },
    {
        name: "Nadia Osei",
        date: "July 29, 2026",
        rating: 5,
        text: "Spacious, spotless, and full of personality. The furniture collection alone saved us a whole prop run before the shoot.",
    },
    {
        name: "Jonas Weber",
        date: "July 8, 2026",
        rating: 4,
        text: "Solid spot for our interview series. Setup was quick, the acoustics were better than expected, and the wifi never dropped once.",
    },
    {
        name: "Maya Thompson",
        date: "June 21, 2026",
        rating: 5,
        text: "Every detail was thought through — from the coffee station to the backup stands. It feels like working in someone's dream studio.",
    },
    {
        name: "Ari Levin",
        date: "June 3, 2026",
        rating: 5,
        text: "Easy freight access made the gear move-in effortless. We'll be back for our next seasonal edit without a second thought.",
    },
];

export function buildReviews(studio: Studio): Review[] {
    const seed = hash(`${studio.id}:reviews`);
    const picks: Review[] = [];
    for (let i = 0; i < 6; i++) {
        const item = REVIEW_POOL[(seed + i * 3) % REVIEW_POOL.length];
        picks.push({ ...item, id: `${studio.id}-r${i}` });
    }
    return picks;
}

export function averageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 5;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 100) / 100;
}

export function ratingScores(rating: number): { label: string; value: string }[] {
    return [
        { label: "Accuracy", value: round1(rating + 0.1).toFixed(1) },
        { label: "Cleanliness", value: round1(rating + 0.05).toFixed(1) },
        { label: "Communication", value: round1(rating + 0.15).toFixed(1) },
    ];
}

/* ----------------------------------- Host --------------------------------- */

export type HostDetails = {
    name: string;
    firstName: string;
    initials: string;
    line: string;
    responseRate: number;
    replyTime: string;
    email?: string;
};

export function buildHost(studio: Studio): HostDetails {
    const name = studio.hostName?.trim() || "StudioSpace Host";
    const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const created = new Date(studio.createdAt);
    const since = Number.isNaN(created.getTime()) ? 2024 : created.getFullYear();

    const seed = hash(`${studio.id}:host`);
    const replyTimes = ["within an hour", "within a couple of hours", "within 3 hours"];

    return {
        name,
        firstName: name.split(/\s+/)[0],
        initials,
        line: `${studio.category} host and local creative. Hosting since ${since}.`,
        responseRate: 92 + (seed % 8),
        replyTime: replyTimes[seed % replyTimes.length],
        email: studio.hostEmail,
    };
}

/* ---------------------------------- Specs --------------------------------- */

export type SpecItem = { label: string; value: string };

export function squareFeet(studio: Studio): number {
    return studio.maxCapacity * 100;
}

export function buildSpecs(studio: Studio): SpecItem[] {
    return [
        { label: "Hourly rate", value: `${formatMoney(studio.hourlyRate)} / hour` },
        { label: "Max capacity", value: `${studio.maxCapacity} people` },
        { label: "Approx. size", value: `${squareFeet(studio).toLocaleString("en-US")} sq ft` },
        { label: "Security deposit", value: formatMoney(studio.securityDeposit) },
        { label: "Minimum booking", value: "2 hours" },
        { label: "Guest service fee", value: "10%" },
        { label: "Category", value: studio.category },
        { label: "Location", value: studio.address },
        { label: "Listed", value: monthYear(studio.createdAt) },
    ];
}

/* ------------------------------- Lead heading ------------------------------ */

export function splitOverview(overview: string): { lead: string; paragraphs: string[] } {
    const text = overview.trim();
    if (!text) {
        return { lead: "A closer look at the space.", paragraphs: [] };
    }

    const firstSentence = text.split(/(?<=[.!?])\s+/)[0] ?? text;
    if (firstSentence.length <= 90 && firstSentence.length < text.length) {
        return {
            lead: firstSentence,
            paragraphs: text
                .slice(firstSentence.length)
                .split(/\n{2,}|\n/)
                .map((p) => p.trim())
                .filter(Boolean),
        };
    }

    const paragraphs = text
        .split(/\n{2,}|\n/)
        .map((p) => p.trim())
        .filter(Boolean);
    return { lead: "A closer look at the space.", paragraphs };
}
