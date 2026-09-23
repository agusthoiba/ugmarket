const CDN = 'https://res.cloudinary.com/dmgyei0o8/image/upload/c_thumb,h_600,w_600/';

module.exports = {
  navItems: [
    { label: 'Keunggulan', href: '#keunggulan', testid: 'nav-link-keunggulan' },
    { label: 'Kalkulator', href: '#kalkulator', testid: 'nav-link-kalkulator' },
    { label: 'Katalog', href: '#katalog', testid: 'nav-link-katalog' },
    { label: 'Cara Daftar', href: '#cara-daftar', testid: 'nav-link-cara-daftar' },
    { label: 'Testimoni', href: '#testimoni', testid: 'nav-link-testimoni' },
    { label: 'FAQ', href: '#faq', testid: 'nav-link-faq' },
  ],

  marqueeItems: ['VINYL', 'CD', 'KAOS', 'HOODIES', 'KASET', 'OFFICIAL MERCH', '0% BIAYA ADMIN', 'DIRECT SELLER TO BUYER', 'UNLIMITED CATALOG'],

  heroStats: [
    { value: '0%', label: 'Biaya admin' },
    { value: '100%', label: 'Dana langsung ke seller' },
    { value: '24/7', label: 'Katalog aktif tanpa batas' },
  ],

  benefits: [
    {
      tag: 'POLICY 01', title: '0% Biaya Admin', big: true, icon: 'bi-percent',
      desc: '100% hasil penjualan masuk ke rekening toko Anda. Kami tidak mengambil komisi sepeser pun dari setiap transaksi.',
    },
    {
      tag: 'AUDIENCE 02', title: 'Niche Audience Musik Ekstrem', icon: 'bi-people',
      desc: 'Pengunjung platform adalah kolektor aktif CD, Vinyl, Kaset, dan merchandise resmi band Metal / Hardcore / Punk.',
    },
    {
      tag: 'CONTROL 03', title: 'Independensi Toko & Pembeli', icon: 'bi-shop',
      desc: 'Kelola stok, harga, dan pengiriman toko Anda sendiri secara langsung — tanpa perantara yang membatasi.',
    },
    {
      tag: 'PAYMENT 04', title: 'Transfer Manual Langsung', icon: 'bi-arrow-left-right',
      desc: 'Pembayaran via transfer manual langsung dari pembeli ke rekening penjual — tanpa escrow, tanpa dana ditahan platform.',
    },
  ],

  catalogTabs: ['Semua', 'Vinyl', 'CD', 'Kaos', 'Hoodies'],

  products: [
    { slug: 'korn-follow-the-leader', name: 'Follow The Leader', band: 'Korn', price: 'Rp 475.000', cat: 'Vinyl', img: CDN + 'vinyl-korn-ftl.jpg.jpg' },
    { slug: 'a7x-nightmare-purple-2lp', name: 'Nightmare - Purple 2LP', band: 'Avenged Sevenfold', price: 'Rp 476.500', cat: 'Vinyl', img: CDN + 'avenged-sevenfold-nightmare-purple-2lp_594c0' },
    { slug: 'bmth-count-your-gold', name: 'Count Your - Metallic Gold', band: 'Bring Me The Horizon', price: 'Rp 675.000', cat: 'Vinyl', img: CDN + 'bring-me-the-horizon-count-your-metallic-gold-vinyl-record_ae510' },
    { slug: 'slipknot-self-titled', name: 'Slipknot (Self Titled)', band: 'Slipknot', price: 'Rp 450.000', cat: 'CD', img: CDN + 'CD%20SlipKnot-Self%20Titled.jpg.jpg' },
    { slug: 'bon-jovi-greatest-hits', name: 'Greatest Hits - 2 CD', band: 'Bon Jovi', price: 'Rp 125.000', cat: 'CD', img: CDN + 'IMG_7418.jpeg.jpg' },
    { slug: 'babymetal-logo-tee', name: 'Logo Tee', band: 'Babymetal', price: 'Rp 195.000', cat: 'Kaos', img: CDN + 'IMG_6772.webp.webp' },
    { slug: 'a7x-asian-tour-tee', name: 'A7X Asian Tour 2024', band: 'Avenged Sevenfold', price: 'Rp 195.000', cat: 'Kaos', img: CDN + 'IMG_7423.jpg.jpg' },
    { slug: 'ugsync-pullover-hoodie', name: 'Pullover Hoodie', band: 'UGSync Official', price: 'Rp 350.000', cat: 'Hoodies', img: 'https://merch.undergroundsync.com/image/hoodie-ugsync.jpg' },
  ],

  steps: [
    { n: '01', title: 'Isi Form Pendaftaran', desc: 'Lengkapi profil toko termasuk kontak WhatsApp. Cuma butuh 2 menit.' },
    { n: '02', title: 'Verifikasi Akun', desc: 'Tim UndergroundSync memverifikasi keabsahan toko / label / distro Anda dalam waktu singkat.' },
    { n: '03', title: 'Upload & Mulai Jualan', desc: 'Masukkan katalog CD, Vinyl, Kaos, atau Hoodies Anda — dan langsung terima pesanan pertama.' },
  ],

  testimonials: [
    { quote: 'Bebas biaya admin 0% bikin kita bisa kasih harga terbaik buat para metalhead tanpa rugi operasional. Rilisan fisik jalan terus.', seller: 'Black Metal Records', genre: 'Death / Black Metal Label', location: 'Bandung', initials: 'BM' },
    { quote: 'Pengunjungnya bener-bener spesifik pencari merchandise metal. Vinyl rilisan terbatas kami cepat habis di sini.', seller: 'Grim Merch Store', genre: 'Hardcore Merch', location: 'Jakarta', initials: 'GM' },
    { quote: 'Ngatur stok dan harga sendiri tanpa dicampuri. Transaksi langsung ke pembeli — persis kayak jualan di gig.', seller: 'Distro Suara Keras', genre: 'Punk / Distro Independen', location: 'Yogyakarta', initials: 'SK' },
  ],

  faqs: [
    { q: 'Apakah benar tidak ada biaya admin (0%)?', a: 'Ya, 100% bebas komisi penjualan. Penjual menerima pembayaran penuh dari harga produk yang ditawarkan — harga jadi lebih jujur untuk pembeli.' },
    { q: 'Syarat apa saja untuk menjadi seller?', a: 'Memiliki produk merchandise musik resmi (band / label / distro), kontak aktif yang bisa dihubungi, dan siap melayani pembeli secara profesional.' },
    { q: 'Produk apa saja yang boleh dijual?', a: 'Rilisan fisik (Vinyl, CD, Kaset), apparel (Kaos, Hoodie, Zipper, Vest, Patch), serta aksesoris resmi band rock & metal.' },
    { q: 'Bagaimana sistem pengiriman dan pembayaran?', a: 'Penjual menentukan kurir pengiriman sendiri. Pembayaran dilakukan transfer manual langsung dari pembeli ke rekening penjual — tanpa perantara, tanpa dana ditahan platform.' },
    { q: 'Bagaimana alur pembayaran transfer manualnya?', a: '<ol class="faq-steps"><li><strong>Pembeli checkout</strong> dan langsung melihat nomor rekening toko Anda.</li><li><strong>Pembeli transfer</strong> sesuai total belanja ke rekening Anda.</li><li><strong>Konfirmasi via WhatsApp</strong> — pembeli mengirim foto bukti bayar ke nomor WhatsApp toko Anda.</li><li><strong>Anda verifikasi</strong> dana masuk di mutasi rekening, lalu proses dan kirim pesanan.</li></ol><p class="faq-note">Semua komunikasi dan dana berjalan langsung antara Anda dan pembeli — platform tidak menahan apa pun.</p>' },
    { q: 'Berapa lama proses verifikasi toko?', a: 'Setelah form pendaftaran dikirim, silahkan cek email untuk verifikasi' },
  ],

  categories: [
    'Rilisan Fisik (Vinyl / CD / Cassette)',
    'Apparel (Kaos / Hoodie / Jacket)',
    'Aksesoris & Patch',
    'Campuran / Full Merch',
  ],

  perks: [
    'Gratis 0% biaya admin seumur hidup',
    'Verifikasi cepat via WhatsApp',
    'Katalog tanpa batas jumlah produk',
    'Komunitas buyer musik ekstrem',
  ],
};
