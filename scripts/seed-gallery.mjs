import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local automatically
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
  // rely on env already set
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
    name: "Contemporary Art",
    slug: "contemporary-art",
    description: "Living artists shaping the visual language of our era",
  },
];

const posts = [
  // ── 1. Peach Blossom Spring — Uncle Zeng ───────────────────────────────────
  {
    title: "Peach Blossom Spring by Uncle Zeng: A Utopia Painted in Oil",
    slug: "peach-blossom-spring-uncle-zeng",
    featured: false,
    excerpt:
      "Uncle Zeng's Peach Blossom Spring transforms an ancient Chinese literary myth into a luminous oil painting that blurs the boundary between memory, longing, and paradise.",
    content: `<p>Some paintings do not simply depict a place — they create one. <em>Peach Blossom Spring</em> by Uncle Zeng is exactly that kind of work: a canvas that pulls the viewer into a world that feels more real than reality, a realm of pink-drifted light and still water that the eye wants to enter and never leave.</p>

<h2>The Literary Source: Tao Yuanming's Eternal Tale</h2>
<p>To understand Uncle Zeng's painting fully, one must first know the story it invokes. In 421 AD, the Chinese poet Tao Yuanming wrote <em>Peach Blossom Spring</em> — a short prose poem about a fisherman who, while following a stream lined with peach trees in full bloom, discovers a hidden valley. Inside, a self-sufficient community has lived untouched by war, taxation, and the suffering of the outside world for generations. The fisherman stays for a time, then leaves and tries to return — but the valley is never found again.</p>
<p>The story has haunted Chinese literary and artistic imagination for sixteen centuries. It is the Chinese archetype of utopia: not a constructed perfection but an accidentally found one, a place that exists not by design but by grace, and that cannot be revisited once left. Every generation of Chinese painters has found something new to say about it, and Uncle Zeng finds something that feels entirely his own.</p>

<h2>Reading the Canvas: Composition and Light</h2>
<p>Painted in oil on canvas at 24 by 36 inches, <em>Peach Blossom Spring</em> uses a horizontal format that mimics the scroll-like proportions of traditional Chinese landscape painting — a visual echo that grounds the work in its cultural inheritance even as it operates within a Western medium. The eye enters from the lower left along a dark passage of water and moves upward and right into an expanding field of blossom-light.</p>
<p>Uncle Zeng does not paint individual peach flowers with botanical precision. Instead, he layers passages of pink, white, and soft gold into atmospheric clouds of color that hover above the water's surface. The technique recalls Monet's late water lily panels — color as sensation rather than description — but the mood is different: warmer, more intimate, less meditative and more yearning.</p>
<p>The water below the blossoms is painted in deep tones of teal and grey-green, perfectly still, a mirror that doubles the light above. This reflective surface is one of the painting's key psychological devices: the world portrayed is already doubled, already existing in two registers at once — the material and the immaterial, the seen and the imagined.</p>

<h2>Uncle Zeng's Technique: Oil as Ink</h2>
<p>Uncle Zeng was trained in traditional Chinese ink painting before moving into oils, and that training is visible in every brushstroke. Where Western oil painters typically build form through layered impasto or careful glazing, Zeng works with a fluidity that suggests the spontaneous, breath-controlled marks of ink on paper. Edges dissolve rather than define. Forms emerge from color rather than line.</p>
<p>This hybrid sensibility is not decorative pastiche — it represents a genuine integration of two visual traditions. The oil medium gives Zeng access to a depth of tone and luminosity that ink cannot achieve, while his ink-painting instincts prevent the work from becoming merely technical. The result is painting that feels both ancient and utterly present.</p>

<h2>What the Painting Withholds</h2>
<p>Crucially, there are no figures in <em>Peach Blossom Spring</em>. The hidden community, the fisherman, the path itself — all are absent. What Zeng gives us is the threshold, the moment before arrival: blossoms and water, light and its reflection, the invitation of a passage that leads somewhere beyond the frame. The painting is structured as a question: <em>Would you go in?</em></p>
<p>This deliberate withholding is what makes the work so effective as an evocation of Tao Yuanming's original story. The poem's deepest subject is not what the valley contains but the impossibility of returning to it. Zeng captures that loss not by depicting absence but by making presence so overwhelming that you feel the pain of never being able to hold it.</p>

<h2>Why This Painting Endures</h2>
<p>In an era saturated with images that demand immediate recognition and reward quick interpretation, <em>Peach Blossom Spring</em> asks for something rarer: sustained attention and a willingness to feel lost. It is a painting about the relationship between beauty and impermanence, about the places — physical, emotional, imagined — to which we can never truly return. Uncle Zeng has made that relationship visible in 24 by 36 inches of oil on canvas, and it is more than enough.</p>`,
    coverImage:
      "https://vancouverfineartgallery.com/wp-content/uploads/2020/02/Uncle-Zeng-Peach-Blossom-Spring-Oil-on-Canvas-24-x-36-in.jpg",
    tags: ["uncle-zeng", "chinese-art", "contemporary", "landscape", "oil-painting"],
    readingTime: 7,
    categorySlug: "contemporary-art",
  },

  // ── 2. Sea of Euphoria — David Hovan ───────────────────────────────────────
  {
    title: "Sea of Euphoria by David Hovan: Where Emotion Meets the Ocean",
    slug: "sea-of-euphoria-david-hovan",
    featured: false,
    excerpt:
      "David Hovan's Sea of Euphoria is a mixed-media seascape that channels the physical power of the ocean into an intensely emotional visual experience — layered, turbulent, and radiantly alive.",
    content: `<p>There is a particular quality of light that exists only at sea — a brightness that comes not just from above but from all directions at once, reflected and re-reflected off shifting surfaces until the world becomes luminous from within. David Hovan's <em>Sea of Euphoria</em> captures that quality with an intensity that few marine painters achieve, and does so through a mixed-media approach that gives the work a physical presence as powerful as the ocean itself.</p>

<h2>The Artist: David Hovan's Visual Language</h2>
<p>David Hovan works at the intersection of realism and abstraction, using the ocean not as a subject to be documented but as a vehicle for exploring states of emotional intensity. His paintings are informed by direct experience of the sea — the way a wave gathers force before breaking, the colour shift that happens in deep water versus shallow, the specific quality of light in the moments after a storm clears.</p>
<p>But Hovan is not a realist in any strict sense. His interest lies in what the ocean feels like rather than what it looks like, and this distinction drives every decision he makes about material, color, and composition.</p>

<h2>Mixed Media as Method: Building the Surface</h2>
<p><em>Sea of Euphoria</em> is executed in mixed media on canvas at 36 by 36 inches — a square format that gives the composition equal weight in all directions, preventing the eye from falling into a simple horizontal reading. Hovan layers his surfaces with a combination of acrylic mediums, oil paint, and textural additives, building up passages that have genuine physical relief — areas where the paint rises from the canvas surface and catches light at angles that change as the viewer moves.</p>
<p>This textural approach is not decoration. It is structural. The ocean is not a flat surface and Hovan refuses to paint it as one. The built-up impasto in the wave crests gives those passages a visual weight that corresponds to their physical reality. When the light hits these raised areas from the side, the painting seems to move — to breathe with the same rhythm as the water it depicts.</p>

<h2>The Color Architecture of Euphoria</h2>
<p>The title claims an emotional state, and the color palette makes good on that claim. Hovan orchestrates a range of blues, from the deep violet-blue of open water to the near-turquoise of shallows catching sky, punctuated by whites that are never simply white — they contain the full spectrum of the light sources bouncing through them. The overall effect is one of chromatic excess, of more color than the eye expects from a seascape, which produces the slightly vertiginous quality the title names: euphoria as a sensory overload that tips into something beyond ordinary pleasure.</p>
<p>There is also warmth in the work — gold and amber tones that suggest late afternoon sun — which prevents the painting from feeling cold despite its oceanic subject. This warmth is the emotional signature of the piece: not the austerity of the open sea but the joy of being in it, of giving yourself to something larger and more powerful than yourself.</p>

<h2>The Square Format and Its Implications</h2>
<p>The 36-by-36-inch square format is worth examining closely. Marine painting has traditionally worked in horizontal formats that echo the horizon — the fundamental visual fact of the ocean. By choosing a square, Hovan disrupts that convention and forces a different kind of attention. Without a dominant horizontal axis, the composition becomes more dynamic, more unstable, more genuinely oceanic. The eye circles rather than scans, which is closer to the actual experience of being surrounded by water than any conventional seascape perspective allows.</p>

<h2>Euphoria as Subject</h2>
<p>What is Hovan actually painting when he paints euphoria? The word comes from the Greek for "bearing well" — originally a medical term for the feeling of physical well-being, later broadened to describe any state of intense happiness. In contemporary usage it carries a slight edge of excess, of a happiness too large to be entirely safe. That edge is present in <em>Sea of Euphoria</em>. This is not a peaceful painting. The ocean in it has force. The light is almost too bright. The color is almost too saturated. It is a painting about a joy that costs something — the surrender of the self to something vast and indifferent. Which is perhaps what the ocean has always been for those who love it: not comfort, but amplitude.</p>`,
    coverImage:
      "https://vancouverfineartgallery.com/wp-content/uploads/2024/10/David-Hovan_Sea-of-Euphoria_Mixed-Media-on-canvas_36x36-in.jpg",
    tags: ["david-hovan", "seascape", "mixed-media", "contemporary", "abstract"],
    readingTime: 7,
    categorySlug: "contemporary-art",
  },

  // ── 3. Iris Field — Olivia Zeng ────────────────────────────────────────────
  {
    title: "Iris Field by Olivia Zeng: A Commission Born from Pure Color",
    slug: "iris-field-olivia-zeng",
    featured: false,
    excerpt:
      "Olivia Zeng's Iris Field is a commissioned oil painting that transforms a simple floral subject into a meditation on color, atmosphere, and the particular joy of flowers in full bloom.",
    content: `<p>A field of irises in full bloom is one of the most visually overwhelming experiences the natural world offers. For a few weeks each spring, the landscape becomes saturated with purples, blues, and whites so intense they seem almost artificial — a natural excess that has attracted painters from Van Gogh to Monet. Olivia Zeng's <em>Iris Field</em>, painted in oil on canvas at 20 by 24 inches, approaches this subject with a freshness and directness that makes it feel newly discovered rather than revisited.</p>

<h2>The Commission: Painting to an Intention</h2>
<p>That <em>Iris Field</em> was created as a commission is worth noting at the outset. Commissioned painting occupies a complex position in contemporary art — less prestigious than the freely chosen work that defines an artist's personal vision, but with a long and honourable history going back to the great patrons of the Renaissance. The best commissioned paintings are not compromises between what the artist wants to make and what the client wants to own; they are works in which client desire provides the constraint within which the artist's instincts find their fullest expression.</p>
<p><em>Iris Field</em> feels like exactly that kind of work. Whatever the original brief was, the painting that resulted belongs entirely to Olivia Zeng's visual sensibility. The commission gave her a subject; what she made of it is entirely her own.</p>

<h2>Color as the Primary Subject</h2>
<p>In <em>Iris Field</em>, Zeng makes color — rather than form or narrative — the primary carrier of meaning. The irises themselves are rendered with enough specificity that they are immediately identifiable, but Zeng resists the temptation of botanical precision. Individual blooms dissolve into passages of violet and blue-purple at the edges of the composition, the field extending beyond the frame as if the painting is a window onto something too large to contain.</p>
<p>The greens of the stems and leaves provide the structural armature of the composition, creating vertical rhythms that organize the pictorial space and prevent the color from becoming purely atmospheric. But these greens are never mechanical: they shift from yellow-green in the lightest passages to near-black in the deepest shadows, carrying as much tonal complexity as the flowers themselves.</p>

<h2>Light and the Impressionist Inheritance</h2>
<p>Zeng's handling of light in <em>Iris Field</em> places her clearly within the Impressionist tradition — not as a stylistic imitation but as a genuine inheritor of that tradition's fundamental concern: the way light transforms the appearance of things moment by moment. The light in the painting feels specific to a time of day, probably mid-morning when the sun is high enough to create clear highlights on the upper petals but still at a low enough angle to cast meaningful shadows.</p>
<p>This specificity of light is what lifts the painting above the category of "pretty floral." It is not a painting of irises in the abstract; it is a painting of these irises, in this light, at this moment. The Impressionists understood that specificity of this kind is what makes a painting feel real rather than merely accurate — and Zeng understands it too.</p>

<h2>The Intimacy of the 20 by 24 Format</h2>
<p>At 20 by 24 inches, <em>Iris Field</em> is a painting sized for intimate viewing. The irises are not quite life-size but close enough that the viewer feels physically near them — at the scale of someone who has crouched down to look carefully at a flower rather than walking past a field. This choice of scale is significant. It positions the viewer not as a surveyor of a landscape but as a participant in a close and attentive encounter with the natural world.</p>
<p>That intimacy is perhaps the painting's deepest quality. In an era when attention is perpetually diffused across screens and notifications, <em>Iris Field</em> asks for — and rewards — the simple act of stopping and looking carefully at something beautiful.</p>

<h2>Olivia Zeng and the Zeng Legacy</h2>
<p>Olivia Zeng belongs to a lineage of painters deeply engaged with the intersection of Chinese aesthetic sensibility and Western oil-painting technique — a lineage that includes Uncle Zeng, whose <em>Peach Blossom Spring</em> engages similar questions of cultural translation from a different angle. Where Uncle Zeng's work tends toward the atmospheric and the mythic, Olivia Zeng's approach in <em>Iris Field</em> is more immediate, more sensory, more firmly rooted in the physical pleasure of color and light. Together, their work represents a richly productive dialogue between traditions — not a synthesis in any forced sense, but a conversation that continues to produce results worth attending to.</p>`,
    coverImage:
      "https://vancouverfineartgallery.com/wp-content/uploads/2022/11/Olivia-Zeng-Iris-Field-Oil-on-Canvas-20x24-in-Commission.jpg",
    tags: ["olivia-zeng", "floral", "impressionism", "oil-painting", "contemporary"],
    readingTime: 7,
    categorySlug: "contemporary-art",
  },

  // ── 4. Peonies — Alexander Sheversky ──────────────────────────────────────
  {
    title: "Peonies by Alexander Sheversky: The Art of Floral Abundance",
    slug: "peonies-alexander-sheversky",
    featured: false,
    excerpt:
      "Alexander Sheversky's Peonies is a monumental floral still life in the tradition of Dutch Golden Age painting — exuberant, technically dazzling, and charged with the particular poignancy of beauty at its peak.",
    content: `<p>The peony has been called the "king of flowers" in Chinese culture for over a thousand years. In Western painting, it appeared as a symbol of prosperity, healing, and the dangerous excess of beauty — a flower so lush it seems always on the verge of collapse under its own weight. Alexander Sheversky's <em>Peonies</em>, painted in oil on canvas at 30 by 40 inches, makes full use of the flower's symbolic weight while demonstrating a level of technical mastery that places the work in direct conversation with the great floral painters of the Dutch Golden Age.</p>

<h2>Alexander Sheversky: Realism as Devotion</h2>
<p>Alexander Sheversky was born in Russia and trained in the rigorous tradition of Russian academic realism before developing his practice as a still-life and portrait painter working in North America. Russian academic training is among the most demanding in the world — it emphasizes extended study from life, mastery of the full tonal range, and a near-scientific understanding of how light behaves on different surfaces. All of this discipline is visible in <em>Peonies</em>, where the rendering of petals, stems, water droplets, and the varying textures of different varieties of bloom reveals a painter who has spent years learning how to see.</p>
<p>But Sheversky is not merely a technician. The paintings he chooses to make — and the choices he makes within them — reveal an artist for whom realism is a form of devotion: an act of sustained attention to the beauty of the material world that transforms careful observation into something close to reverence.</p>

<h2>Composition: The Dutch Tradition Revisited</h2>
<p>The compositional logic of <em>Peonies</em> draws directly on the tradition established by Jan van Huysum, Rachel Ruysch, and the great floral painters of seventeenth-century Holland. Flowers are arranged in a loose pyramid or bouquet form that suggests natural abundance while carefully controlling the distribution of light and colour across the picture plane. Dark backgrounds isolate the blooms against shadow, making each flower read as a luminous object rather than a flat pattern.</p>
<p>What Sheversky brings to this tradition is a contemporary fluency — the bouquet in <em>Peonies</em> has a looseness and informality that the Dutch masters, working from assembled specimens in winter studios, could not always achieve. The peonies feel freshly cut, their stems still holding the suppleness of recently living wood, their petals open at different stages in a way that suggests they were painted quickly, before the flowers could fade.</p>

<h2>Light on Petals: The Technical Achievement</h2>
<p>The central technical challenge of floral still life painting is the rendering of petals — translucent, thin, varying in color from the bright outer surface to the shadowed interior folds. Sheversky meets this challenge with a virtuosity that rewards close inspection. The petals in <em>Peonies</em> are not simply painted pink or white; they contain blues, yellows, creams, and warm shadows that make them read as genuinely three-dimensional, genuinely organic surfaces.</p>
<p>The light in the painting appears to come from the upper left — a classic compositional choice that casts the flowers in a clear, directional illumination that creates strong highlights on the turned faces of the outer petals and deep, rich shadows in the interior of the blooms. These shadows are never simply dark; they contain color — the warm reflected light from nearby petals, the cool blue of ambient skylight — and it is this coloristic complexity in the shadows that makes the painting feel lit rather than merely illustrated.</p>

<h2>The Peony's Symbolism and Sheversky's Intent</h2>
<p>Peonies bloom for a short, intense period in late spring. Their flowers open quickly and fall almost as quickly; the fully opened bloom is also the bloom closest to dropping its petals. This relationship between peak beauty and imminent decline is central to the peony's symbolic resonance across cultures — it is a flower that insists on its own transience.</p>
<p>Sheversky's decision to paint peonies at their fullest, most extravagant state is therefore not a simple celebration of beauty. It is a painting about a particular moment: the peak that is already the beginning of the end. This is the theme that connects the tradition of floral still life painting to the larger tradition of <em>vanitas</em> — the meditation on impermanence that runs through so much of Western art. Sheversky does not labour the point; he lets the flowers make it. But it is there, quietly, in every opened bloom.</p>

<h2>Scale and Presence</h2>
<p>At 30 by 40 inches, <em>Peonies</em> is a painting that imposes itself on a room. The flowers are rendered at roughly life-size, which means that standing in front of the canvas is something like standing in front of an actual bouquet — except that the bouquet will not fade, its peak will not pass, the petals will not fall. The painting holds the moment of fullness permanently, which is both what all painting does and, in this particular case, the deepest thing the work has to say.</p>`,
    coverImage:
      "https://vancouverfineartgallery.com/wp-content/uploads/2021/03/Alexander-Sheversky-Peonies-Oil-on-Canvas-30-x-40-in.jpg",
    tags: ["alexander-sheversky", "floral", "still-life", "oil-painting", "realism"],
    readingTime: 8,
    categorySlug: "contemporary-art",
  },

  // ── 5. San Giorgio Maggiore at Dusk — Monet ────────────────────────────────
  {
    title: "San Giorgio Maggiore at Dusk: Monet's Venice in Dissolving Light",
    slug: "san-giorgio-maggiore-at-dusk-monet-1908",
    featured: false,
    excerpt:
      "Painted during Monet's only visit to Venice in 1908, San Giorgio Maggiore at Dusk captures the city's legendary light at the precise moment it tips from gold into violet — a masterpiece of Impressionist dissolution.",
    content: `<p>Claude Monet arrived in Venice in October 1908 at the age of 68, accompanied by his wife Alice. He had been reluctant to go — he had long believed that Venice was unpainta ble, that it was too famous, too already-painted, that whatever he could do had already been done better by Turner. He was wrong, and he knew it almost immediately. He worked with a kind of urgency that surprised even him, producing thirty-seven canvases in under three months, many of them among the most radiant works of his career.</p>

<h2>The Venice Series: A City Made of Light</h2>
<p>Monet's Venice paintings are different from everything else he made. His earlier series — haystacks, Rouen Cathedral, the Thames, the water lilies — had all been concerned with the transformation of specific, familiar subjects by changing conditions of light. Venice offered him something unprecedented: a city that was itself already composed of light and water, a place where the boundaries between the built environment and its reflections were permanently unstable.</p>
<p>The lagoon around Venice functions as a vast mirror, doubling every surface, fragmenting every reflection in the movement of the water, making the city appear to float in its own image. For a painter whose entire practice had been organized around the instability of light, Venice was the perfect subject: a world already doing what he was trying to do.</p>

<h2>San Giorgio Maggiore at Dusk: The Painting</h2>
<p>The island of San Giorgio Maggiore sits directly across the Venetian lagoon from the Piazza San Marco. Palladio's church, begun in 1566, rises from the island in one of the great masterpieces of Renaissance architecture — its white Istrian stone facade designed to catch and hold the light across the water. Monet painted it multiple times during his Venice stay, under different conditions and at different hours. <em>San Giorgio Maggiore at Dusk</em> is the most celebrated of these canvases, and among the most beautiful paintings of his career.</p>
<p>The painting was made in 1908. The exact time of day Monet chose — the last light before darkness — was not accidental. Dusk over the Venetian lagoon is one of the most extraordinary optical phenomena in Europe: the sky moves through an almost implausible sequence of golds, ambers, pinks, and violets in the space of perhaps twenty minutes, the water below mirroring and modifying each shift. To paint it is to work in a state of emergency: the light is changing faster than the hand can move.</p>

<h2>Dissolution as Style and Subject</h2>
<p>The painting depicts the island and church from across the water, but "depicts" may be too strong a word. What Monet actually gives us is an impression — the sense of architectural presence at the threshold of visibility, the forms of the bell tower and facade legible enough to be identified but dissolved enough to feel like memory rather than direct observation. The sky above occupies more than half the canvas and blazes in horizontal bands of orange, gold, and the first traces of violet dusk. The water below is darker, more fractured, a broken mirror of what is above.</p>
<p>The technique is one of Monet's most purely Impressionist: individual brushstrokes visible, forms defined by color relationship rather than drawn edge, the surface of the canvas frankly present. And yet the image coalesces. The brain assembles Palladio's church from a hundred touches of pale grey-gold paint, a bell tower from a dark vertical stroke, a rippled reflection from horizontal dragged marks of orange and deep water-blue. The painting is about this act of assembly — about perception as an active process that constructs the world from fragments of sensation.</p>

<h2>The Context: Late Monet and the Road to Abstraction</h2>
<p>The Venice paintings occupy a significant position in the larger narrative of Monet's late career. They were made at the same time he was beginning to conceive the monumental <em>Water Lilies</em> panels, the project that would consume the last two decades of his life and produce works that subsequent generations of abstract painters — particularly the Abstract Expressionists of the 1940s and 50s — would recognize as direct predecessors.</p>
<p><em>San Giorgio Maggiore at Dusk</em> is not quite an abstract painting. But it is very close to the point where representation dissolves entirely into color and gesture, which is perhaps why it continues to feel modern — indeed, contemporary — more than a century after it was made. The chromatic field of the sky, the way the architectural subject is present but not fully materialized, the equal weight given to the directly seen and the reflected: all of these prefigure not just the <em>Water Lilies</em> but Abstract Expressionism, Color Field painting, and the broader tradition of painting in which the physical act of applying color becomes the subject of the work.</p>

<h2>Where the Painting Lives</h2>
<p><em>San Giorgio Maggiore at Dusk</em> is held in the collection of the National Museum Wales in Cardiff. Monet's Venice series was exhibited in Paris in 1912 to enormous acclaim; the paintings were recognized immediately as masterworks and have never fallen from that estimation. To stand in front of this canvas is to be inside a specific moment of light on the Venetian lagoon in October 1908 — which is, of course, impossible. But painting at its best makes the impossible available, briefly, to the eye.</p>`,
    coverImage:
      "https://www.claude-monet.com/assets/img/paintings/san-giorgio-maggiore-at-dusk.jpg",
    tags: ["monet", "venice", "impressionism", "dusk", "water"],
    readingTime: 8,
    categorySlug: "impressionism",
  },

  // ── 6. Van Gogh Garden at Arles ────────────────────────────────────────────
  {
    title: "Van Gogh's Garden at Arles: Color, Joy, and the South of France",
    slug: "van-gogh-garden-at-arles",
    featured: false,
    excerpt:
      "Van Gogh arrived in Arles in February 1888 looking for light. The garden paintings he produced there — vibrant, urgent, trembling with color — are among the most joyful works he ever made.",
    content: `<p>On February 20, 1888, Vincent van Gogh stepped off a train in Arles, in the south of France, into a landscape he had never seen before. The light was extraordinary — harder, brighter, and more colorful than anything he had known in the grey north. He had come looking for something, though he could not have named it precisely: a place where color might do the things he needed it to do, where the visual world would cooperate with his ambitions as a painter. Arles, he discovered almost immediately, was that place.</p>

<h2>Arles: The Year of Transformation</h2>
<p>The fifteen months Van Gogh spent in Arles represent the most productive and in many ways the most radiant period of his career. He produced over 200 paintings there, along with more than 100 drawings and watercolors. The subjects were those immediately around him: the town, the surrounding countryside, the night sky, the people he met, and — with particular intensity — the garden of the Yellow House, the modest dwelling he rented on the Place Lamartine and turned into the studio he had always dreamed of having.</p>
<p>The garden paintings made at Arles are distinct from everything Van Gogh made before or after. In the north — in Holland and in the Borinage — his palette had been dark, the colors of earth and shadow, of peasant labour and grey winter skies. In Paris he had lightened it, learning from the Impressionists. But in Arles, something broke open. The colors came up to full strength. The brushwork found its characteristic rhythm. The work became unmistakably itself.</p>

<h2>The Garden as Subject</h2>
<p>Van Gogh's garden paintings from Arles are not topographical records — he was not interested in documenting the garden as a botanist or landscape designer might. He was interested in the garden as a site of pure color relationship, as a place where the greens of grass and leaf and stem could be set against the yellows and oranges of flowers, the blues and purples of the sky and shadows, in combinations that felt simultaneously natural and invented.</p>
<p>The garden at the Yellow House was modest — a walled enclosure with some grass, flowerbeds, and trees. But Van Gogh transformed it, on canvas, into something more: a compressed version of the natural world organized by color rather than by botanical category, a place where every surface vibrates against every adjacent surface in a kind of organized excitement.</p>

<h2>Brushwork as Energy</h2>
<p>The technical achievement of Van Gogh's Arles garden paintings is the integration of color and mark into a single expressive unit. Each brushstroke is simultaneously a unit of color and a unit of energy — you feel the speed and pressure of its application, the direction of the painter's wrist, the particular intensity of his attention at the moment of making it. This is painting in which the act of painting is continuously visible, continuously present, which is part of what makes it feel so alive.</p>
<p>The thick impasto — paint applied so heavily it rises from the canvas surface — creates a texture that catches light differently depending on the viewing angle. A Van Gogh garden painting changes as you move in front of it: passages that seem flat from a distance reveal themselves as almost sculptural from the side. The physical substance of the paint becomes part of the meaning of the work.</p>

<h2>Joy as a Painting Problem</h2>
<p>Van Gogh wrote to his brother Theo about the Arles period with an intensity of feeling that makes the letters almost difficult to read. He was happy — genuinely, fully happy — and he knew it might not last. The garden paintings carry that knowledge. They are not serene; they vibrate with an urgency that has joy in it but also something of the desperate awareness that this particular light, this particular state of feeling, cannot be held.</p>
<p>"The garden is tremendous," he wrote. He was trying to convey in paint what he experienced standing in that small walled space in the southern light: a fullness that was almost too much, a beauty that demanded immediate response. The paintings are that response — not a considered representation but an act of matching, of meeting the world's intensity with an equivalent intensity of mark and color.</p>

<h2>The Road from Arles</h2>
<p>Van Gogh left Arles in May 1889, following the episode that led to his self-hospitalization in Saint-Rémy. The garden paintings he made there — the garden of the asylum — are different: more enclosed, more turbulent, already marked by what had happened. The Arles garden paintings retain a quality that those later works, for all their power, do not quite have: the quality of pure discovery, of a painter finding out what he can do with color in the light he has been waiting his whole life to paint. They are among the greatest paintings of the nineteenth century, and they were made by someone who knew, with terrible clarity, that such moments do not last.</p>`,
    coverImage:
      "https://media.desenio.com/site_images/685d9c029ba509224c94c9cd_738248952_19380-5.jpg?auto=compress%2Cformat&fit=max&w=3840",
    tags: ["van-gogh", "arles", "garden", "post-impressionism", "color"],
    readingTime: 8,
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

  // Also load existing categories (fine-art, impressionism, etc.)
  const allCats = await Category.find().lean();
  for (const c of allCats) {
    if (!categoryMap[c.slug]) categoryMap[c.slug] = c._id;
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
