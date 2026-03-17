import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve } from "path";

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
} catch { /* rely on env */ }

const MONGODB_URI = process.env.MONGODB_URI;

const PostSchema = new mongoose.Schema(
  {
    title: String, slug: String, content: String, excerpt: String,
    coverImage: String, featured: Boolean,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [String], status: String, readingTime: Number,
    views: Number, reactions: Object, publishedAt: Date,
  },
  { timestamps: true },
);
const Post = mongoose.models.Post ?? mongoose.model("Post", PostSchema);

// ── 1. Slugs to DELETE (Turkish + test posts) ─────────────────────────────────
const SLUGS_TO_DELETE = [
  "minimal-tasarimin-gucu",
  "typescript-ile-daha-guvenli-kod",
  "sabah-rutininin-uretkenlige-etkisi",
  "nextjs-app-router-yeni-paradigma",
  "renk-teorisi-ve-dijital-tasarim",
  "yavas-yasamak-dijital-detoks-uzerine",
];

// ── 2. Reliable cover images (Wikimedia Commons — public domain) ──────────────
const IMAGE_UPDATES = [
  {
    slug: "vincent-van-gogh-the-restless-brushstroke",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
  },
  {
    slug: "claude-monet-and-the-language-of-light",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
  },
  {
    slug: "picassos-cubism-seeing-the-world-in-fragments",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg",
  },
  {
    slug: "leonardo-da-vinci-where-art-and-science-converge",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
  },
  {
    slug: "hokusai-and-the-great-wave-japans-visual-poetry",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg",
  },
  {
    slug: "rembrandt-the-master-of-light-and-shadow",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg",
  },
  {
    slug: "frida-kahlo-pain-identity-and-bold-color",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Frida_Kahlo_by_Guillermo_Kahlo.jpg/800px-Frida_Kahlo_by_Guillermo_Kahlo.jpg",
  },
  {
    slug: "salvador-dalis-dreamscapes-surrealism-unleashed",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg",
  },
  {
    slug: "michelangelo-the-divine-hand-of-the-renaissance",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  },
  {
    slug: "vermeers-secret-light-silence-and-the-everyday",
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
  },
];

// ── 3. Excerpt fixes (max 160 chars) ─────────────────────────────────────────
const EXCERPT_UPDATES = [
  {
    slug: "peach-blossom-spring-uncle-zeng",
    excerpt:
      "Uncle Zeng transforms an ancient Chinese myth into a luminous oil painting that blurs the boundary between memory, longing, and paradise.",
  },
  {
    slug: "sea-of-euphoria-david-hovan",
    excerpt:
      "David Hovan's Sea of Euphoria channels the ocean's power into an emotional mixed-media canvas — layered, turbulent, and radiantly alive.",
  },
  {
    slug: "iris-field-olivia-zeng",
    excerpt:
      "Olivia Zeng's Iris Field transforms a floral commission into a meditation on color, atmosphere, and the pure joy of irises in full bloom.",
  },
  {
    slug: "peonies-alexander-sheversky",
    excerpt:
      "Sheversky's Peonies draws on Dutch Golden Age tradition — exuberant, technically dazzling, charged with the poignancy of beauty at its peak.",
  },
  {
    slug: "san-giorgio-maggiore-at-dusk-monet-1908",
    excerpt:
      "Painted in Venice in 1908, Monet's San Giorgio at Dusk captures the city's light at the precise moment it tips from gold into violet.",
  },
  {
    slug: "van-gogh-garden-at-arles",
    excerpt:
      "Van Gogh arrived in Arles looking for light. The garden paintings he made there — vibrant, urgent, trembling with color — are his most joyful.",
  },
  // seed-art.mjs posts — verify lengths are under 160 and clean up any that aren't
  {
    slug: "vincent-van-gogh-the-restless-brushstroke",
    excerpt:
      "Swirling skies, luminous wheat fields, and sleepless nights — Van Gogh's art is raw emotion pressed directly onto canvas.",
  },
  {
    slug: "claude-monet-and-the-language-of-light",
    excerpt:
      "Monet spent a lifetime chasing light — on haystacks, cathedral façades, and the still surface of his beloved water garden at Giverny.",
  },
  {
    slug: "picassos-cubism-seeing-the-world-in-fragments",
    excerpt:
      "Cubism shattered the single viewpoint governing Western painting for five centuries, and Picasso was its most restless architect.",
  },
  {
    slug: "leonardo-da-vinci-where-art-and-science-converge",
    excerpt:
      "Da Vinci filled thousands of notebook pages with anatomical drawings and flying machines — all in service of understanding how to paint.",
  },
  {
    slug: "hokusai-and-the-great-wave-japans-visual-poetry",
    excerpt:
      "A single woodblock print — a cresting wave about to swallow fishing boats — became one of the most recognized images in human history.",
  },
  {
    slug: "rembrandt-the-master-of-light-and-shadow",
    excerpt:
      "Rembrandt painted faces as if light itself were confiding in them — no other artist has rendered human interiority so directly.",
  },
  {
    slug: "frida-kahlo-pain-identity-and-bold-color",
    excerpt:
      "Kahlo turned personal suffering into one of the twentieth century's most powerful visual languages — unflinching and unmistakably her own.",
  },
  {
    slug: "salvador-dalis-dreamscapes-surrealism-unleashed",
    excerpt:
      "Dalí brought the illogic of dreams into hyper-realistic focus — images so precise and so impossible the mind struggles to dismiss them.",
  },
  {
    slug: "michelangelo-the-divine-hand-of-the-renaissance",
    excerpt:
      "From the Sistine Chapel ceiling to the towering David, Michelangelo pushed the human form to its most transcendent expression.",
  },
  {
    slug: "vermeers-secret-light-silence-and-the-everyday",
    excerpt:
      "Vermeer painted ordinary rooms in ordinary light with such luminous precision that they feel suspended in a time outside of time.",
  },
];

// ── Run ───────────────────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ MongoDB connected\n");

  // 1. Delete Turkish/test posts
  console.log("── Deleting Turkish posts ──");
  for (const slug of SLUGS_TO_DELETE) {
    const res = await Post.deleteOne({ slug });
    if (res.deletedCount > 0) {
      console.log(`  ✗ Deleted: ${slug}`);
    } else {
      console.log(`  · Not found: ${slug}`);
    }
  }

  // 2. Update cover images
  console.log("\n── Updating cover images ──");
  for (const { slug, coverImage } of IMAGE_UPDATES) {
    const res = await Post.updateOne({ slug }, { $set: { coverImage } });
    if (res.matchedCount > 0) {
      console.log(`  ✓ Image updated: ${slug}`);
    } else {
      console.log(`  · Not found: ${slug}`);
    }
  }

  // 3. Update excerpts
  console.log("\n── Updating excerpts ──");
  for (const { slug, excerpt } of EXCERPT_UPDATES) {
    if (excerpt.length > 160) {
      console.warn(`  ⚠ Excerpt too long (${excerpt.length}): ${slug}`);
    }
    const res = await Post.updateOne({ slug }, { $set: { excerpt } });
    if (res.matchedCount > 0) {
      console.log(`  ✓ Excerpt updated (${excerpt.length} chars): ${slug}`);
    } else {
      console.log(`  · Not found: ${slug}`);
    }
  }

  console.log("\n✓ Maintenance complete");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
