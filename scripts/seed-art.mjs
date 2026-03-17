import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local so MONGODB_URI doesn't have to be passed on the command line
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local not found — rely on environment variables already set
}

const MONGODB_URI = process.env.MONGODB_URI;

// ── Schemas ──────────────────────────────────────────────────────────────────

const CategorySchema = new mongoose.Schema(
  { name: String, slug: String, description: String },
  { timestamps: true },
);

const PostSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    content: String,
    excerpt: String,
    coverImage: String,
    featured: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [String],
    status: { type: String, default: "published" },
    readingTime: Number,
    views: { type: Number, default: 0 },
    reactions: { like: Number, heart: Number, fire: Number },
    publishedAt: Date,
  },
  { timestamps: true },
);

const Category =
  mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
const Post = mongoose.models.Post ?? mongoose.model("Post", PostSchema);

// ── Data ─────────────────────────────────────────────────────────────────────

const categories = [
  {
    name: "Fine Art",
    slug: "fine-art",
    description: "Painting, sculpture, and the timeless visual arts",
  },
  {
    name: "Impressionism",
    slug: "impressionism",
    description: "Light, color, and the revolution of the Impressionist masters",
  },
  {
    name: "Modern Art",
    slug: "modern-art",
    description: "Cubism, Expressionism, Surrealism, and the avant-garde",
  },
  {
    name: "Renaissance",
    slug: "renaissance",
    description: "The rebirth of classicism, humanism, and artistic genius",
  },
  {
    name: "Japanese Art",
    slug: "japanese-art",
    description: "From ukiyo-e woodblocks to Zen brushwork and beyond",
  },
];

const posts = [
  // ── 1. Van Gogh ─────────────────────────────────────────────────────────────
  {
    title: "Vincent van Gogh: The Restless Brushstroke",
    slug: "vincent-van-gogh-the-restless-brushstroke",
    featured: true,
    excerpt:
      "Swirling skies, luminous wheat fields, and sleepless nights — Van Gogh's art is raw emotion pressed directly onto canvas.",
    content: `<p>Vincent van Gogh produced over 2,100 artworks in just a decade, yet sold only one painting during his lifetime. Today, his canvases hang in the world's great museums and command hundreds of millions at auction. His is one of art history's most poignant stories: a man who painted furiously to hold himself together.</p>
<h2>The Post-Impressionist Revolution</h2>
<p>Where the Impressionists sought to capture fleeting light, Van Gogh went further — he wanted to express the emotional truth beneath what the eye sees. His thick, directional brushstrokes pulse with energy. Look at <em>The Starry Night</em> (1889) and you feel the night sky breathing, the stars vibrating with a life of their own.</p>
<p>His palette was deliberately expressive rather than naturalistic. Yellows blaze beyond what sunlight actually looks like; blues go deeper than any sky. These choices were not accidents — they were the grammar of a private language.</p>
<h2>Letters to Theo</h2>
<p>Van Gogh wrote over 800 letters to his brother Theo, filling them with thoughts on painting, literature, and life. These letters are extraordinary documents: a running commentary on what it feels like to be an artist consumed by vision. "I dream of painting," he wrote, "and then I paint my dream."</p>
<p>He described color as capable of suggesting something of the terrible passions of humanity. Every canvas was a battle, every finished work both victory and exhaustion.</p>
<h2>Legacy</h2>
<p>Van Gogh's influence on Expressionism, Fauvism, and nearly every emotionally charged art movement since is incalculable. He demonstrated that technique serves feeling — not the other way around. A century and a half later, his restless brushstroke still refuses to be still.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&auto=format&fit=crop",
    tags: ["van-gogh", "post-impressionism", "expressionism"],
    readingTime: 5,
    categorySlug: "fine-art",
  },

  // ── 2. Monet ────────────────────────────────────────────────────────────────
  {
    title: "Claude Monet and the Language of Light",
    slug: "claude-monet-and-the-language-of-light",
    featured: false,
    excerpt:
      "Monet spent a lifetime chasing light — on cathedral façades, haystacks, and the still surface of his beloved water garden at Giverny.",
    content: `<p>In the summer of 1896, Claude Monet dragged his easel to the edge of the Seine at dawn, at midday, and again at dusk. He was painting the same haystack — not for lack of subjects, but because he understood that light, not objects, was the true subject of painting.</p>
<h2>The Birth of Impressionism</h2>
<p>When Monet exhibited <em>Impression, Sunrise</em> at the 1874 Paris salon, a critic used the title mockingly to coin the term "Impressionism." Monet and his circle adopted the label with pride. Their shared mission: to capture the sensory experience of a moment rather than its physical facts.</p>
<p>Monet worked en plein air — outdoors, in natural light — pushing paint onto the canvas with urgency. The loose, broken brushwork that critics initially mocked eventually changed the entire trajectory of Western art.</p>
<h2>Giverny and the Water Lilies</h2>
<p>In 1883, Monet moved to Giverny in Normandy and spent the next forty years transforming its grounds into the garden he would paint. He designed the Japanese footbridge, the weeping willows, and the lily pond not as a retreat but as a studio — an outdoor canvas he could rearrange at will.</p>
<p>The <em>Water Lilies</em> series, comprising roughly 250 paintings, culminated in the monumental panels now housed in the Orangerie museum in Paris. Painted almost entirely after cataracts had blurred his vision, these late works are shimmering, nearly abstract fields of color that feel decades ahead of their time.</p>
<h2>Seeing Differently</h2>
<p>Monet once said he wished he had been born blind so that he could suddenly gain sight and begin to paint without knowing what the objects before him were. He wanted to see pure sensation — light and color before the mind named them. That ambition gives his work a freshness that has never aged.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1533158628620-7e4d3829eddf?w=1200&auto=format&fit=crop",
    tags: ["monet", "impressionism", "water-lilies"],
    readingTime: 5,
    categorySlug: "impressionism",
  },

  // ── 3. Picasso ──────────────────────────────────────────────────────────────
  {
    title: "Picasso's Cubism: Seeing the World in Fragments",
    slug: "picassos-cubism-seeing-the-world-in-fragments",
    featured: false,
    excerpt:
      "Cubism shattered the single viewpoint that had governed Western painting for five centuries, and Picasso was its most restless architect.",
    content: `<p>Sometime in 1907, Pablo Picasso pinned a large canvas to the wall of his studio at the Bateau-Lavoir in Montmartre and began the painting that would eventually be called <em>Les Demoiselles d'Avignon</em>. When he showed it to fellow artists and collectors, the reaction was one of shock and bewilderment. Something had broken — and Picasso had broken it deliberately.</p>
<h2>The Logic Behind the Fragments</h2>
<p>Renaissance painting had organized the picture plane around a single, fixed viewpoint — as if the viewer stood still and a window opened onto the world. Picasso and Georges Braque asked: why should a painting be limited to one moment of seeing? A face has a front and a profile; why not show both simultaneously?</p>
<p>Cubism dismantles an object into planes and reassembles them on the canvas from multiple perspectives at once. The result is disorienting at first glance, but intellectually it is more honest about how we actually know things — through accumulated experience, memory, and multiple encounters.</p>
<h2>Analytic and Synthetic</h2>
<p>Art historians divide Cubism into two phases. Analytic Cubism (roughly 1908–1912) is austere: muted grays and browns, objects fractured almost beyond recognition. Synthetic Cubism came next — bolder colors, collaged materials, newspaper fragments glued to canvas. It introduced everyday life directly into fine art.</p>
<p>Both phases influenced everything that followed: Futurism, Constructivism, abstract painting, graphic design, and architecture all carry Cubism's DNA.</p>
<h2>Picasso Beyond Cubism</h2>
<p>Picasso never stopped reinventing himself. Neoclassical periods, Surrealist phases, politically charged works like <em>Guernica</em> (1937) — his career spans so many styles it reads like a one-man history of twentieth-century art. But Cubism remains his most radical and lasting contribution: proof that a painting can think.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop",
    tags: ["picasso", "cubism", "modern-art"],
    readingTime: 5,
    categorySlug: "modern-art",
  },

  // ── 4. Da Vinci ─────────────────────────────────────────────────────────────
  {
    title: "Leonardo da Vinci: Where Art and Science Converge",
    slug: "leonardo-da-vinci-where-art-and-science-converge",
    featured: false,
    excerpt:
      "Da Vinci filled thousands of notebook pages with anatomical drawings, flying machines, and hydraulic studies — all in service of understanding how to paint.",
    content: `<p>Leonardo da Vinci left fewer than twenty paintings. He left over 7,000 pages of notebooks. That disproportion tells you something essential about him: he was not chiefly a painter but a man who used painting as one instrument in a lifelong investigation of the natural world.</p>
<h2>The Notebooks</h2>
<p>Leonardo's notebooks are extraordinary in their range. On a single page you might find a diagram of the human heart alongside a sketch of a canal lock, a note on the flight mechanics of birds, and a study for a painting. He wrote in mirror script — right to left — possibly out of habit as a left-hander, possibly for privacy. The notebooks were never organized for publication; they are windows into a restless, omnivorous intelligence.</p>
<p>His anatomical drawings, made from dissections he performed himself, surpassed anything available in print at the time. The muscles of the hand, the structure of the eye, the chambers of the heart — all rendered with a precision that would not be rivaled for generations.</p>
<h2>Sfumato and the Mona Lisa</h2>
<p>Painting technique absorbed Leonardo as deeply as anatomy. He invented or perfected <em>sfumato</em> — from the Italian for "smoke" — a method of blending tones so gradually that outlines dissolve into atmosphere. It is why the Mona Lisa's smile is so elusive: the corners of the mouth are rendered in shadow that the eye reads differently depending on where it focuses.</p>
<p>He also mastered <em>chiaroscuro</em>, the dramatic modulation of light and dark that gives his figures a three-dimensional presence no previous painter had achieved quite so convincingly.</p>
<h2>The Unfinished</h2>
<p>Many of Leonardo's greatest projects were never completed. He had a tendency to abandon works once the intellectual problems they posed had been solved — finishing felt almost beside the point. The <em>Adoration of the Magi</em>, the <em>Battle of Anghiari</em>, countless designs for machines: all incomplete. Perhaps the notebooks were his real masterpiece — not a record of finished thoughts, but of thinking itself.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&auto=format&fit=crop",
    tags: ["da-vinci", "renaissance", "genius"],
    readingTime: 6,
    categorySlug: "renaissance",
  },

  // ── 5. Hokusai ──────────────────────────────────────────────────────────────
  {
    title: "Hokusai and The Great Wave: Japan's Visual Poetry",
    slug: "hokusai-and-the-great-wave-japans-visual-poetry",
    featured: false,
    excerpt:
      "A single woodblock print — a cresting wave about to swallow three fishing boats — became one of the most recognized images in human history.",
    content: `<p>Katsushika Hokusai was 71 years old when he published <em>Under the Wave off Kanagawa</em>, better known as <em>The Great Wave</em>. It was one print in a series of thirty-six views of Mount Fuji. He had been making prints and paintings for over fifty years. He would live to 88 and work until nearly the last day of his life.</p>
<h2>Ukiyo-e: Pictures of the Floating World</h2>
<p>Ukiyo-e — "pictures of the floating world" — was a genre of Japanese art that flourished between the 17th and 19th centuries. It depicted the pleasures of urban life: kabuki actors, sumo wrestlers, beautiful courtesans, and landscapes. Printed from carved wooden blocks, ukiyo-e were affordable and widely distributed, the popular media of their era.</p>
<p>Hokusai mastered the form and then pushed far beyond it. His landscapes transformed a genre associated with city entertainment into vehicles for contemplating nature's power and scale.</p>
<h2>The Wave</h2>
<p>The Great Wave is simultaneously terrifying and precise. The claw-like foam at the wave's crest grabs at the tiny boats below. In the background, Mount Fuji — permanent, snow-capped, dwarfed by the temporary but overwhelming surge of water — provides scale and contrast. The composition obeys no single visual tradition; it draws on both Japanese aesthetics and Dutch perspective prints that Hokusai studied intently.</p>
<p>The Prussian blue pigment, newly available from European trade, gave the print its distinctive deep tones. It was a technological import used in the service of a distinctly Japanese vision.</p>
<h2>A Life of Constant Reinvention</h2>
<p>Hokusai changed his artistic name at least thirty times, reinventing his practice with each change. He called himself "an old man mad about painting." At 75, he wrote that he had drawn everything, but nothing he produced before 73 was of any real value. He hoped to finally understand how things truly looked by 90. He did not quite make it — but what he left behind suggests he came very close.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&auto=format&fit=crop",
    tags: ["hokusai", "ukiyo-e", "japanese-art"],
    readingTime: 5,
    categorySlug: "japanese-art",
  },

  // ── 6. Rembrandt ────────────────────────────────────────────────────────────
  {
    title: "Rembrandt: The Master of Light and Shadow",
    slug: "rembrandt-the-master-of-light-and-shadow",
    featured: false,
    excerpt:
      "Rembrandt van Rijn painted faces as if light itself were confiding in them — no other artist has rendered human interiority so directly.",
    content: `<p>Rembrandt Harmenszoon van Rijn produced roughly 300 paintings, 300 etchings, and 2,000 drawings during his long career. Almost any one of them would be the crowning achievement of a lesser artist's life. Together they constitute perhaps the most sustained exploration of the human face and figure in Western art history.</p>
<h2>Chiaroscuro as Emotion</h2>
<p>Rembrandt took the technique of chiaroscuro — the dramatic contrast between light and dark — further than any of his predecessors. In his paintings, figures emerge from deep shadow as if the darkness were their natural element. Light falls selectively: on a lined forehead, on folded hands, on the edge of a collar. Everything else recedes.</p>
<p>This is not mere technical virtuosity. The darkness in a Rembrandt painting carries emotional weight. It is the darkness of human experience — of memory, grief, and the passing of time.</p>
<h2>The Self-Portraits</h2>
<p>Rembrandt made approximately ninety self-portraits across his career — more than any other major artist of his era. They begin in youth: confident, theatrical, trying on different expressions and costumes. They end in old age: the face mapped by time, the gaze steady and unsparing. There is no flattery and no self-pity. Just looking.</p>
<p>These works are remarkable documents of a life observed from within. They also served a practical purpose — Rembrandt used his own face as a model when other sitters were unavailable. But the series adds up to something far more than convenience: an autobiography in paint.</p>
<h2>The Night Watch</h2>
<p><em>The Night Watch</em> (1642) is the most famous painting in the Netherlands, and its scale is part of the experience — over 11 feet tall and 14 feet wide. It depicts a militia company preparing to march, figures caught mid-motion, light and shadow animating the scene with a dynamism unprecedented in group portraiture. It turned a civic commission into a painting about the nature of collective action and individual identity.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1200&auto=format&fit=crop",
    tags: ["rembrandt", "baroque", "chiaroscuro"],
    readingTime: 5,
    categorySlug: "fine-art",
  },

  // ── 7. Frida Kahlo ──────────────────────────────────────────────────────────
  {
    title: "Frida Kahlo: Pain, Identity, and Bold Color",
    slug: "frida-kahlo-pain-identity-and-bold-color",
    featured: false,
    excerpt:
      "Kahlo turned personal suffering into one of the twentieth century's most powerful visual languages — unflinching, symbolic, and unmistakably her own.",
    content: `<p>Frida Kahlo completed 143 paintings, of which 55 are self-portraits. "I paint myself because I am so often alone," she said, "and because I am the subject I know best." But her self-portraits are not confessional in any simple sense — they are carefully constructed images that use her body as a site for exploring pain, identity, politics, and the complicated relationship between Mexican and European culture.</p>
<h2>The Accident and the Aftermath</h2>
<p>In 1925, at 18, Kahlo was severely injured in a bus accident. She suffered a broken spinal column, collarbone, ribs, and pelvis, along with eleven fractures in her right leg. She would undergo more than 35 surgeries in her lifetime. During her long recoveries, confined to bed, she began to paint — her mother had a special easel made so she could work lying down.</p>
<p>Pain became not just a subject but a medium. Works like <em>The Broken Column</em> (1944) and <em>Without Hope</em> (1945) render physical anguish with a directness that can be difficult to look at, and impossible to forget.</p>
<h2>Symbolism and Mexican Identity</h2>
<p>Kahlo's paintings are dense with symbolism drawn from Mexican folk art, pre-Columbian imagery, Catholic iconography, and surrealist motifs. She wore traditional Tehuana dress not merely as fashion but as a political statement — an assertion of indigenous Mexican identity against European influence.</p>
<p>André Breton called her work surrealist, but Kahlo rejected the label. "I never painted dreams," she said. "I painted my own reality." The distinction matters: her imagery, however fantastical it appears, is always rooted in lived experience.</p>
<h2>Rediscovery and Legacy</h2>
<p>During her lifetime, Kahlo's fame was largely overshadowed by her husband Diego Rivera. Her major retrospective recognition came posthumously, accelerating in the 1970s and 1980s as feminist art history recovered her work. Today she is among the most recognized artists in the world — her face on merchandise, her name invoked in countless contexts. The challenge for viewers now is to get past the icon and encounter the paintings themselves: difficult, precise, and quietly radical.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&auto=format&fit=crop",
    tags: ["frida-kahlo", "surrealism", "self-portrait"],
    readingTime: 5,
    categorySlug: "modern-art",
  },

  // ── 8. Dalí ─────────────────────────────────────────────────────────────────
  {
    title: "Salvador Dalí's Dreamscapes: Surrealism Unleashed",
    slug: "salvador-dalis-dreamscapes-surrealism-unleashed",
    featured: false,
    excerpt:
      "Dalí brought the illogic of dreams into hyper-realistic focus, creating images so precise and so impossible that the mind struggles to dismiss them.",
    content: `<p>Salvador Dalí once described his method as "hand-painted dream photographs." The description is exact. His canvases have the crisp, almost clinical detail of academic realism — and the content of fever dreams. Melting watches draped over a barren landscape. Elephants with impossibly elongated legs. A telephone with a lobster for a receiver. The images are absurd, but they are rendered with a precision that forces the eye to take them seriously.</p>
<h2>The Paranoiac-Critical Method</h2>
<p>Dalí developed what he called the paranoiac-critical method: a way of accessing irrational imagery by deliberately inducing a kind of controlled delirium. He would sit in a chair holding a heavy key over a metal plate, allowing himself to doze until the moment of sleep — when the key would drop, the noise would wake him, and he would capture whatever images hovered at the threshold of consciousness.</p>
<p>This was not automatic writing in the Surrealist sense — Dalí was not passive. He selected, refined, and composed. The paranoiac-critical method was a tool for generating material; his extraordinary technical skill was what turned it into art.</p>
<h2>The Persistence of Memory</h2>
<p><em>The Persistence of Memory</em> (1931) is roughly the size of a hardcover book — 24 by 33 centimeters. Its monumental status in the art world is entirely disproportionate to its physical dimensions. The soft watches are now one of the most recognized images in the world. Dalí said he conceived the central image while staring at a melting piece of Camembert cheese.</p>
<p>The painting's subject is time — its elasticity, its subjectivity, the way it warps in dreams. But its power comes from the precise rendering: every detail is sharp and convincing, which makes the central impossibility all the more unsettling.</p>
<h2>The Showman</h2>
<p>Dalí cultivated his own persona as aggressively as any artwork: the upturned mustache, the calculated provocations, the public performances. Some critics felt the showmanship undermined the seriousness of the work. But the persona was itself a kind of surrealist project — an image constructed to destabilize expectations, to make the ordinary strange. In that sense, Dalí never stopped working.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop",
    tags: ["dali", "surrealism", "dream"],
    readingTime: 6,
    categorySlug: "modern-art",
  },

  // ── 9. Michelangelo ─────────────────────────────────────────────────────────
  {
    title: "Michelangelo: The Divine Hand of the Renaissance",
    slug: "michelangelo-the-divine-hand-of-the-renaissance",
    featured: false,
    excerpt:
      "From the Sistine Chapel ceiling to the towering David, Michelangelo pushed the human form to its most transcendent expression in stone and paint.",
    content: `<p>Michelangelo di Lodovico Buonarroti Simoni insisted he was a sculptor above all else. The four-year commission to paint the Sistine Chapel ceiling, he claimed, was an imposition forced on him by Pope Julius II. And yet the 500 square meters of fresco he produced between 1508 and 1512 represent perhaps the single most ambitious artistic undertaking in the history of Western civilization.</p>
<h2>The Ceiling</h2>
<p>The Sistine Chapel ceiling contains nine scenes from Genesis surrounded by prophets, sibyls, ignudi, and hundreds of other figures — all painted while Michelangelo stood on scaffolding with his neck craned upward, paint dripping into his eyes. He wrote a comic poem about the discomfort: "My beard turns up to heaven; my nape falls in, fixed on my spine... my brush, above my face continually, makes it a splendid floor by dripping down."</p>
<p>The figures in the ceiling are monumental — classical in pose but superhuman in scale, their muscles defined with an authority no previous artist had commanded. The Creation of Adam, with its almost-touching fingers suspended across the vault, achieves a visual economy that makes theological content immediately legible from sixty feet below.</p>
<h2>The David</h2>
<p>The marble <em>David</em> (1501–1504) stands seventeen feet tall. It depicts the biblical shepherd not after the victory over Goliath — as was conventional — but in the moment before, his gaze fixed on the approaching giant, his hand holding the sling, every muscle taut with concentrated resolve. The psychological specificity is remarkable: this is a figure in the act of deciding.</p>
<p>Michelangelo famously said that the sculpture already exists within the marble; the sculptor's task is simply to remove everything that is not the sculpture. Whatever the metaphysics, the result in David's case is a figure of such physical conviction that viewers often describe feeling slightly nervous in its presence.</p>
<h2>Poetry and Old Age</h2>
<p>In his later years, Michelangelo turned increasingly to architecture — the dome of St. Peter's Basilica is largely his design — and to a deeply personal body of poetry. The poems are austere and spiritually searching, very different from the triumphant power of the early sculptures. They are the work of a man who had been called divine since his twenties, reckoning with what divinity actually means in the face of death.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&auto=format&fit=crop",
    tags: ["michelangelo", "sistine-chapel", "sculpture"],
    readingTime: 6,
    categorySlug: "renaissance",
  },

  // ── 10. Vermeer ─────────────────────────────────────────────────────────────
  {
    title: "Vermeer's Secret: Light, Silence, and the Everyday",
    slug: "vermeers-secret-light-silence-and-the-everyday",
    featured: false,
    excerpt:
      "Vermeer painted ordinary rooms in ordinary light with such luminous precision that they feel suspended in a time outside of time.",
    content: `<p>Johannes Vermeer produced roughly 34 known paintings in his entire career. He spent his life in Delft, never traveled far, and died leaving behind substantial debts and eleven children. He was largely forgotten for two centuries. When he was rediscovered in the mid-nineteenth century, it was with something approaching astonishment: how had this painter been overlooked?</p>
<h2>The Interior World</h2>
<p>Almost all of Vermeer's paintings depict the same room — or a room very like it — in his house in Delft. A window on the left admits cool northern light. A woman reads a letter, pours milk, plays a lute, or holds a balance. The compositions are quiet to the point of silence. Nothing dramatic is happening. And yet the paintings are impossible to leave.</p>
<p>The secret is light. Vermeer understood light as a physical force with material presence — the way it falls on a white wall, clings to the folds of a yellow jacket, turns the surface of milk into something luminous. He seems to have used a camera obscura to achieve his unprecedented accuracy of observation. Whether tool or no, the eye he brought to the task was extraordinary.</p>
<h2>Girl with a Pearl Earring</h2>
<p><em>Girl with a Pearl Earring</em> (1665) is sometimes called the "Dutch Mona Lisa," and not just because of its fame. Like Leonardo's portrait, it derives its power from ambiguity. The girl turns toward the viewer — or toward someone just behind the viewer. Her lips are parted. Her expression is entirely legible and completely unreadable. The pearl earring catches the light with a precision that makes you want to reach out and touch it.</p>
<p>We know nothing about who she was. The painting has no title in Vermeer's hand. The ambiguity is not a puzzle to be solved; it is a condition of the work's power.</p>
<h2>Slow Looking</h2>
<p>Vermeer's paintings reward a kind of attention that our era makes difficult. They do not demand; they offer. Stand in front of one long enough and the light in the room begins to feel like the light in the painting — the same quality of cool, diffuse northern daylight that has changed very little in three and a half centuries. That continuity is what makes Vermeer's interiors feel less like history and more like a room you might step into.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop",
    tags: ["vermeer", "dutch-golden-age", "light"],
    readingTime: 5,
    categorySlug: "fine-art",
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ MongoDB connected");

  // Create or find categories
  const categoryMap = {};
  for (const cat of categories) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create(cat);
      console.log(`  + Category created: ${cat.name}`);
    } else {
      console.log(`  · Category exists: ${cat.name}`);
    }
    categoryMap[cat.slug] = existing._id;
  }

  // Create posts
  for (const post of posts) {
    const existing = await Post.findOne({ slug: post.slug });
    if (existing) {
      console.log(`  · Post exists, skipping: ${post.title}`);
      continue;
    }
    const { categorySlug, ...postData } = post;
    await Post.create({
      ...postData,
      category: categoryMap[categorySlug],
      status: "published",
      publishedAt: new Date(),
      reactions: { like: 0, heart: 0, fire: 0 },
    });
    console.log(`  + Post created: ${post.title}`);
  }

  console.log("\n✓ Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
