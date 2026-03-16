import mongoose from "mongoose";

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
  { name: "Tasarım", slug: "tasarim", description: "UI/UX ve görsel tasarım üzerine yazılar" },
  { name: "Teknoloji", slug: "teknoloji", description: "Yazılım, araçlar ve yenilikler" },
  { name: "Yaşam", slug: "yasam", description: "Günlük hayat ve kişisel deneyimler" },
];

const posts = [
  {
    title: "Minimal Tasarımın Gücü",
    slug: "minimal-tasarimin-gucu",
    featured: true,
    excerpt:
      "Daha azı daha fazladır. Minimal tasarım yaklaşımı, karmaşıklığı ortadan kaldırarak kullanıcıya net ve odaklı bir deneyim sunar.",
    content: `<p>Minimal tasarım, yüzeyin altında derin bir düşünce sürecini barındırır. Her element bir amaca hizmet eder; gereksiz olanlar acımasızca çıkarılır.</p>
<h2>Neden Minimal?</h2>
<p>Kullanıcılar her gün yüzlerce arayüzle etkileşime giriyor. Bu yoğunluk içinde sadelik bir rahatlama noktası oluyor. Minimal tasarım, dikkat dağıtıcı unsurları kaldırarak kullanıcının asıl amacına odaklanmasını sağlar.</p>
<p>Apple'dan Dieter Rams'a, iyi tasarımın temel prensibi hep aynı: <em>az ama öz</em>. Bir arayüzde ne kadar çok element varsa, kullanıcının zihinsel yükü o kadar artar.</p>
<h2>Boşluğun Değeri</h2>
<p>Beyaz alan (white space) bir tasarımcının en güçlü araçlarından biridir. Boşluk, içeriğin nefes almasını sağlar ve gözün doğal olarak önemli noktalara yönelmesine yardımcı olur.</p>
<p>Minimal tasarım sadece estetik bir tercih değil, aynı zamanda işlevsel bir karardır. Sade arayüzler daha hızlı yüklenir, daha kolay bakım yapılır ve kullanıcı hatalarını azaltır.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&auto=format&fit=crop",
    tags: ["minimal", "ui", "tasarim"],
    readingTime: 4,
    categorySlug: "tasarim",
  },
  {
    title: "TypeScript ile Daha Güvenli Kod",
    slug: "typescript-ile-daha-guvenli-kod",
    featured: false,
    excerpt:
      "TypeScript, JavaScript projelerinde tip güvenliği sağlayarak hataları geliştirme aşamasında yakalamanıza yardımcı olur.",
    content: `<p>JavaScript'in dinamik yapısı hız kazandırırken, büyük projelerde tip hatalarına zemin hazırlar. TypeScript bu sorunu derleme zamanında çözer.</p>
<h2>Tip Sistemi Neden Önemli?</h2>
<p>Bir fonksiyona yanlış tipte argüman geçtiğinizde TypeScript sizi hemen uyarır. Bu, runtime'da ortaya çıkacak hataları geliştirme sürecine taşır — maliyeti çok daha düşük bir noktaya.</p>
<pre><code>interface Post {
  id: string;
  title: string;
  publishedAt: Date;
}

function formatTitle(post: Post): string {
  return post.title.toUpperCase();
}</code></pre>
<h2>Pratik Faydalar</h2>
<p>TypeScript kullanan takımlarda kod tabanı daha okunabilir hale gelir. Fonksiyonların ne aldığı ve ne döndürdüğü açıkça bellidir. IDE desteği de ciddi ölçüde gelişir — otomatik tamamlama ve refactoring çok daha güvenilir çalışır.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop",
    tags: ["typescript", "javascript", "yazilim"],
    readingTime: 5,
    categorySlug: "teknoloji",
  },
  {
    title: "Sabah Rutininin Üretkenliğe Etkisi",
    slug: "sabah-rutininin-uretkenlige-etkisi",
    featured: false,
    excerpt:
      "Güne nasıl başladığınız, gün boyunca nasıl hissedeceğinizi ve ne kadar üretken olacağınızı doğrudan etkiler.",
    content: `<p>Sabahları alarm sesine uzanıp telefonu kapatmak ve sosyal medyaya dalmak... Bu döngü çoğumuza tanıdık. Ama bu alışkanlık, zihnimizi günün henüz başında dağıtıyor.</p>
<h2>İlk 30 Dakika</h2>
<p>Sabahın ilk yarım saatinde ekrandan uzak kalmak, zihnin kendi ritmine oturmasını sağlar. Bu sürede yapılabilecekler: bir bardak su, birkaç dakika yürüyüş, ya da sessizce kahve içmek.</p>
<p>Araştırmalar, sabahları kortizol seviyesinin doğal olarak yüksek olduğunu gösteriyor. Bu hormon, odaklanma ve karar verme kapasitemizi destekliyor. Ekran başına geçmek ise bu doğal yükselişi sekteye uğratıyor.</p>
<h2>Küçük Adımlar</h2>
<p>Büyük rutinler kurmak yerine küçük başlamak çok daha sürdürülebilir. Tek bir alışkanlık — her sabah 10 dakika okumak gibi — zamanla diğer alışkanlıklar için bir çapa işlevi görür.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop",
    tags: ["uretkenlik", "rutin", "yasam"],
    readingTime: 3,
    categorySlug: "yasam",
  },
  {
    title: "Next.js App Router: Yeni Paradigma",
    slug: "nextjs-app-router-yeni-paradigma",
    featured: false,
    excerpt:
      "Next.js 13 ile gelen App Router, React Server Components üzerine inşa edilmiş yeni bir zihinsel model sunuyor.",
    content: `<p>Next.js'in App Router'ı, sadece yeni bir yönlendirme sistemi değil — uygulamaları nasıl düşündüğümüzü değiştiren bir paradigma değişikliği.</p>
<h2>Server Components</h2>
<p>Varsayılan olarak tüm bileşenler sunucu tarafında çalışıyor. Bu demek oluyor ki veritabanı sorguları, API çağrıları ve dosya okuma işlemleri doğrudan bileşen içinde yapılabilir — herhangi bir useEffect veya loading state olmadan.</p>
<pre><code>// Bu bileşen sunucuda çalışır
async function BlogPage() {
  const posts = await db.posts.findMany();
  return &lt;PostList posts={posts} /&gt;;
}</code></pre>
<h2>Ne Zaman Client Component?</h2>
<p>Etkileşim gerektiren her şey için <code>'use client'</code> direktifi kullanılır. Formlar, animasyonlar, tarayıcı API'leri bu kategoriye girer. Kural basit: mümkün olduğunca sunucuda tut.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop",
    tags: ["nextjs", "react", "webdev"],
    readingTime: 6,
    categorySlug: "teknoloji",
  },
  {
    title: "Renk Teorisi ve Dijital Tasarım",
    slug: "renk-teorisi-ve-dijital-tasarim",
    featured: false,
    excerpt:
      "Renkler yalnızca estetik değil, duygusal ve işlevsel mesajlar taşır. Doğru renk seçimi bir tasarımı sıradan olmaktan çıkarır.",
    content: `<p>Bir ürünün rengini gördüğünüzde ilk 90 saniye içinde o ürün hakkında bir yargıya varırsınız. Renk, iletişimin en hızlı kanalıdır.</p>
<h2>Renk Modelleri</h2>
<p>Ekran tasarımında HSL ve OKLCH modelleri giderek yaygınlaşıyor. RGB'nin aksine bu modeller insan algısına daha yakın çalışır — aynı parlaklıkta farklı tonlar elde etmek çok daha kolay.</p>
<p>Özellikle OKLCH, perceptually uniform bir renk uzayı sunuyor. Bu da şu anlama geliyor: iki rengin "ne kadar farklı göründüğü" matematiksel mesafeleriyle doğrudan örtüşüyor.</p>
<h2>Kontrast ve Erişilebilirlik</h2>
<p>WCAG standartlarına göre metin ile arka plan arasında en az 4.5:1 kontrast oranı olmalı. Bu sadece yasal bir gereklilik değil — düşük kontrastlı metinler herkes için okumayı zorlaştırır.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=1200&auto=format&fit=crop",
    tags: ["renk", "tasarim", "ui"],
    readingTime: 4,
    categorySlug: "tasarim",
  },
  {
    title: "Yavaş Yaşamak: Dijital Detoks Üzerine",
    slug: "yavas-yasamak-dijital-detoks-uzerine",
    featured: false,
    excerpt:
      "Sürekli bağlı olmak bir seçim haline geldi. Ama bazen en üretken eylem, bağlantıyı kesmektir.",
    content: `<p>Ortalama bir insan günde 4-5 saat ekrana bakıyor. Bu süreyi azaltmak değil, daha bilinçli kullanmak asıl mesele.</p>
<h2>Dijital Tokluğun Belirtileri</h2>
<p>Sabah uyandığınızda ilk iş telefonunuzu kontrol etmek, bir şeyler yaparken sürekli bildirim beklentisi, ekransız geçirilen sürelerde huzursuzluk hissi — bunların hepsi dijital tokluğun işaretleri.</p>
<p>Bu durum bir ahlaki zafiyet değil, tamamen tasarım gereği. Sosyal medya platformları ve uygulamalar dikkatinizi mümkün olduğunca uzun süre tutmak için optimize edilmiş.</p>
<h2>Küçük Adımlar</h2>
<p>Tam bir detoks yerine küçük sınırlar belirlemek daha sürdürülebilir. Yemek sırasında telefonsuz oturmak, yatmadan bir saat önce ekranları kapatmak, hafta sonunda birkaç saatlik "çevrimdışı" blokları oluşturmak — bunların hepsi başlangıç için yeterli.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop",
    tags: ["dijital-detoks", "minimalizm", "yasam"],
    readingTime: 3,
    categorySlug: "yasam",
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ MongoDB bağlantısı kuruldu");

  // Kategorileri oluştur veya bul
  const categoryMap = {};
  for (const cat of categories) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create(cat);
      console.log(`  + Kategori oluşturuldu: ${cat.name}`);
    } else {
      console.log(`  · Kategori mevcut: ${cat.name}`);
    }
    categoryMap[cat.slug] = existing._id;
  }

  // Postları oluştur
  for (const post of posts) {
    const existing = await Post.findOne({ slug: post.slug });
    if (existing) {
      console.log(`  · Post mevcut, atlanıyor: ${post.title}`);
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
    console.log(`  + Post oluşturuldu: ${post.title}`);
  }

  console.log("\n✓ Seed tamamlandı");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
