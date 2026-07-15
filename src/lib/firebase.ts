import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GalleryItem, Testimonial } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Seed initial gallery items if empty or contains legacy stock / western images
export async function seedDatabaseIfEmpty() {
  try {
    const gallerySnapshot = await getDocs(collection(db, 'gallery'));
    let shouldSeedGallery = gallerySnapshot.empty;

    // Smart self-repair check: If there are legacy Unsplash images or western designs, clear and re-seed with our customized images
    if (!gallerySnapshot.empty) {
      const hasUnsplashOrWestern = gallerySnapshot.docs.some(doc => {
        const data = doc.data();
        const imageUrl = (data.image || data.imageUrl || data.img || '').toLowerCase();
        const title = (data.title || '').toLowerCase();
        // Be extremely aggressive: if it contains unsplash.com, photo-1512436991641, photo-1583939003579, couple, or kiss, we must purge!
        return imageUrl.includes('unsplash.com') || 
               imageUrl.includes('1512436991641') || 
               imageUrl.includes('1583939003579') || 
               imageUrl.includes('couple') || 
               imageUrl.includes('kiss') || 
               title.includes('tuxedo') || 
               title.includes('co-ord') || 
               title.includes('gown') ||
               title.includes('couple') ||
               title.includes('kiss');
      });
      if (hasUnsplashOrWestern) {
        console.log('Legacy Unsplash or western designs detected. Performing automated purge and re-seeding customized Pakistani designs...');
        for (const docItem of gallerySnapshot.docs) {
          await deleteDoc(doc(db, 'gallery', docItem.id));
        }
        shouldSeedGallery = true;
      }
    }

    if (shouldSeedGallery) {
      console.log('Seeding initial custom Pakistani couture gallery items...');
      const initialGallery: Omit<GalleryItem, 'id'>[] = [
        {
          title: 'Royal Crimson Bridal Lehenga',
          category: 'bridal',
          image: '/images/crimson_lehenga_1784082214336.jpg',
          description: 'Exquisite traditional crimson red bridal lehenga featuring heavy antique gold zardozi and tilla hand-embroidery on premium raw silk.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Blush Pink Heavily-Embellished Anarkali',
          category: 'bridal',
          image: '/images/blush_anarkali_1784082258171.jpg',
          description: 'Luxury bridal pishwas anarkali gown in soft rose blush pink, detailed with heavy tilla embroidery, metallic sequins, and silver beadwork.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Sage Green Open-Jacket Anarkali',
          category: 'bridal',
          image: '/images/sage_anarkali_1784082277389.jpg',
          description: 'Stunning mint sage green open-jacket style long bridal anarkali with fine silver zari, kora embroidery, and detailed motifs.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Cream Ivory Sharara Set',
          category: 'party',
          image: '/images/ivory_sharara_1784082237503.jpg',
          description: 'Elegant cream ivory raw silk sharara set decorated with delicate gold tilla borders and an embroidered organza dupatta.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Turquoise Blue Flared Pishwas',
          category: 'party',
          image: '/images/turquoise_frock_1784082297066.jpg',
          description: 'Vibrant turquoise blue flared pishwas frock with intricate silver mirror and sequence embroidery.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Silver Grey Maxi Gown',
          category: 'party',
          image: '/images/silver_maxi_1784082314509.jpg',
          description: 'High-fashion silver grey flared maxi gown with heavy metallic sequence embellishments and a contrasting royal blue dupatta.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Black Velvet Lehenga',
          category: 'party',
          image: '/images/black_lehenga_1784082334514.jpg',
          description: 'Royal midnight black velvet lehenga featuring gorgeous gold tilla and dabka border embroidery with a sheer ivory dupatta.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Off-White Pearl Straight Kurta',
          category: 'party',
          image: '/images/ivory_kurta_1784082353949.jpg',
          description: 'Minimalist off-white raw silk straight kameez suit with delicate scalloped pearl hem and matching silk trousers.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Classic Bespoke Sherwani',
          category: 'formal',
          image: '/images/groom_sherwani_1784082435071.jpg',
          description: 'Bespoke high-neck groom sherwani in classic ivory gold raw silk, featuring intricate hand embroidery on the collar and sleeves.',
          createdAt: new Date().toISOString()
        },
        {
          title: 'Daily Wear Cotton Lawn Kurti',
          category: 'casual',
          image: '/images/lawn_kurti_1784082457617.jpg',
          description: 'Modern casual daily-wear traditional lawn cotton kurti suit, with elegant floral block-print patterns and matching culottes.',
          createdAt: new Date().toISOString()
        }
      ];

      for (const item of initialGallery) {
        await addDoc(collection(db, 'gallery'), item);
      }
    }

    const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
    let shouldSeedTestimonials = testimonialsSnapshot.empty;

    // Self-healing: clean up old ones and seed all 50 if database has fewer than 40 reviews
    if (!testimonialsSnapshot.empty) {
      const hasWesternTestimonial = testimonialsSnapshot.docs.some(doc => {
        const data = doc.data();
        const feedback = (data.feedback || '').toLowerCase();
        const imageUrl = (data.image || data.imageUrl || data.avatar || '').toLowerCase();
        const name = (data.name || '').toLowerCase();
        return feedback.includes('gown') || 
               feedback.includes('tuxedo') || 
               feedback.includes('gala') || 
               feedback.includes('couple') || 
               feedback.includes('kiss') || 
               imageUrl.includes('unsplash.com') || 
               imageUrl.includes('1512436991641') || 
               imageUrl.includes('1583939003579') || 
               imageUrl.includes('couple') || 
               imageUrl.includes('kiss') ||
               name.includes('couple') ||
               name.includes('kiss');
      });
      const count = testimonialsSnapshot.size;
      if (hasWesternTestimonial || count < 40) {
        console.log(`Database has ${count} reviews. Under threshold of 40 or contains western themes. Seeding 50 premium traditional reviews...`);
        for (const docItem of testimonialsSnapshot.docs) {
          await deleteDoc(doc(db, 'testimonials', docItem.id));
        }
        shouldSeedTestimonials = true;
      }
    }

    if (shouldSeedTestimonials) {
      console.log('Seeding initial approved traditional testimonials...');
      const initialTestimonials: Testimonial[] = [
        {
          name: 'Mariam Malik',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'Naveed Signature Stitch is simply unmatched in Lahore. My royal crimson wedding lehenga was tailored to absolute perfection. The antique gold zardozi handwork and the perfect flare were exactly what I wanted. Master Naveed\'s precision is flawless!',
          approved: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Bilal Siddiqui',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Outstanding tailoring for my festive sherwani. The raw silk has a beautiful fall, the high collar sits perfectly without pinching, and the hand-embroidered details on the sleeves look incredibly premium. Best bespoke experience.',
          approved: true,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Zainab Riaz',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'I got a gorgeous emerald velvet sharara stitched for a family dholki. The tilla stitching has a super luxury couture feel, and the alignment of the panels is incredibly clean. Will definitely return for my next event!',
          approved: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Hamza Butt',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'I ordered a classic black raw silk bandhgala with custom gold signature buttons. The fit is exceptionally sharp around the shoulders and waist. Truly master-class tailoring!',
          approved: true,
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Fatima Hashmi',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'I sent an inspiration photo from Pinterest of a luxury designer pishwas, and the recreation was 100% exact! From the neck alignment to the micro-pleats, the stitching quality is world-class.',
          approved: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Ayesha Sheikh',
          dressType: 'Casual Wear',
          rating: 5,
          feedback: 'Master Naveed\'s daily wear cotton lawn kurtis are styled so elegantly. The loop-button detailing and custom cuff designs make casual wear look incredibly polished and high-end.',
          approved: true,
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sarmad Alvi',
          dressType: 'Formal Wear',
          rating: 4,
          feedback: 'Great fit on my formal waistcoat and kurta set. The collar stitching is pristine, and the fabric suggestion was excellent. Sizing is highly precise and comfortable.',
          approved: true,
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Hiba Fawad',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'We got our daughter\'s wedding pishwas and heavy bridal maxi custom stitched. The fit was absolutely elite, and the traditional gota work coupled with pristine silk tissue felt extremely opulent.',
          approved: true,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sana Jamil',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'Exceptional work recreating a high-end designer gown. The fall of the silk satin fabric and the flawless hidden zip line show the master craftsmanship of the team. 10/10!',
          approved: true,
          createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Zahid Mahmood',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Highly professional tailors. The linen kurta salwar set fits perfectly. Master Naveed understands anatomical patterns perfectly, which is rare in Lahore.',
          approved: true,
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Mahnoor Lodhi',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'Amazing experience with my festive organza gharara. The scalloped gold lace borders were stitched with absolute neatness, and the pants fit very comfortably.',
          approved: true,
          createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Kamran Qureshi',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Got custom slim-fit luxury cotton salwar kameez for Eid. The collar stiffness is exactly what I requested, and the stitching is clean and secure. Very reliable tailors.',
          approved: true,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sidra Amin',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'My walima gown in ice-blue pastel was breathtaking! The silver dabka and micro-pearl embroidery were delicate, and the fitting didn\'t require even a single adjustment.',
          approved: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Noman Shah',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Master Naveed designed a stunning deep navy jamawar prince coat for my brother\'s wedding. The fabric drape and internal lining are stitched with great finesse.',
          approved: true,
          createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sadia Ejaz',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'We had three luxury silk frocks stitched for our family wedding. The panel pleating and flare were exactly as requested. Exceptional customer care and timely delivery.',
          approved: true,
          createdAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Tariq Jamil',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Excellent craftsmanship on my custom wedding sherwani. The gold zardozi motif on the back was stitched beautifully. Thank you, Naveed Signature Stitch.',
          approved: true,
          createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Amina Bukhari',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'Recreated a heavy chiffon dupatta with custom hand-crafted sitara laces. The finishing was extremely clean, with premium satin pipings on all four borders.',
          approved: true,
          createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Faisal Bashir',
          dressType: 'Formal Wear',
          rating: 4,
          feedback: 'The bespoke white cotton kurta and raw silk waistcoat set was stitched beautifully. Perfect for formal summer lunches. Sizing is highly precise.',
          approved: true,
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Rabia Chaudhry',
          dressType: 'Casual Wear',
          rating: 5,
          feedback: 'Got several linen and jacquard suits stitched for daily office wear. The necklines are modern and minimalist, and the straight trouser fit is superb.',
          approved: true,
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Usman Dar',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'Incredible attention to detail on my custom-designed velvet bandhgala coat. The stitching lines are straight, and the canvas padding feels very high-end.',
          approved: true,
          createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Khadija Ali',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'Master Naveed hand-crafted my gorgeous mustard mehndi gharara. The colorful gota borders and customized tassel details on the back were stunning!',
          approved: true,
          createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Haris Mughal',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Ordered custom formal suits and waistcoats. The stitching is exceptionally tight and neat, and the chest padding holds its shape beautifully. Highly recommended in Township.',
          approved: true,
          createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Amara Khan',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'Perfect fitting for my heavy silk angrakha. The double-layered flare is extremely elegant, and the master tailor took time to understand my exact requirements.',
          approved: true,
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Saad Rafique',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'The raw silk kurta and trousers are masterfully cut. Master Naveed\'s tailoring is highly scientific; the armhole doesn\'t pull even when moving.',
          approved: true,
          createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Zoya Hassan',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'Requested a replica of an antique royal pishwas. The team sourced identical gold kiran lace and stitched the twenty-four panels with remarkable accuracy.',
          approved: true,
          createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Imran Malik',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Excellent service! The black jamawar sherwani fits like a glove. Received countless compliments at the wedding. Will surely recommend Naveed Signature!',
          approved: true,
          createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Fariha Lodhi',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'Stitched a luxury banarsi dupatta with custom velvet borders. The finish is professional, without any loose threads or bunching of fabric. Very satisfied.',
          approved: true,
          createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Raza Ahmed',
          dressType: 'Formal Wear',
          rating: 4,
          feedback: 'Custom white linen salwar kameez tailored flawlessly. The front pocket embroidery is subtle and elegant. Outstanding quality.',
          approved: true,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Tayyaba Butt',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'My sister\'s wedding gharara was stitched with majestic perfection. The silk lining was soft and comfortable, which is so important for long wedding hours.',
          approved: true,
          createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Yousaf Khan',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'The master tailor drafted a custom waistcoat pattern that completely complements my posture. A truly bespoke experience that standard boutiques can\'t match.',
          approved: true,
          createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Mehreen Tariq',
          dressType: 'Casual Wear',
          rating: 5,
          feedback: 'Delighted with my lawn cotton suits! The lace insertions and scalloped hems are stitched with absolute neatness. Professional service through and through.',
          approved: true,
          createdAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Adnan Sheikh',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Outstanding custom tailoring! The raw silk bandhgala was delivered 2 days before the promised date. Perfect fit and stellar finishing.',
          approved: true,
          createdAt: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sehrish Waseem',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'Got a stunning raw silk tulip trouser and short kurti set stitched. The drape of the tulip pants is flawless. Master Naveed is a genius!',
          approved: true,
          createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Waqar Ali',
          dressType: 'Formal Wear',
          rating: 4,
          feedback: 'The raw silk sherwani fitting is incredible. Clean shoulders and elegant neck height. Excellent service and highly accommodating team.',
          approved: true,
          createdAt: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Kiran Fatima',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'Absolutely loved my custom stitched organza frock with multi-colored patchwork on the sleeves. The neatness of the stitch lines is incredible.',
          approved: true,
          createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Daniyal Shah',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'High-collar off-white kurta set with custom metallic buttonholes. Fits perfectly around the cuffs and neck. Extremely clean stitching.',
          approved: true,
          createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Nida Yasir',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'Outstanding bridal dress. The hand-crafted zardozi details on the sleeves and heavy border are incredibly dense and luxurious. High-end couture.',
          approved: true,
          createdAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Babar Azam',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Got my formal wedding reception sherwani stitched here. The shoulder fit and body contouring are impeccable. Master Naveed is truly the best tailor in Lahore.',
          approved: true,
          createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Saba Qamar',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'Perfect velvet kaftan tailoring! The custom gold embroidery around the neckline is stunning, and the drapes flow beautifully. Luxury service!',
          approved: true,
          createdAt: new Date(Date.now() - 41 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Asif Mahmood',
          dressType: 'Casual Wear',
          rating: 5,
          feedback: 'Simple, neat, and highly precise everyday cotton salwar kameez tailoring. The price is highly justified for the quality they deliver.',
          approved: true,
          createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Maria B',
          dressType: 'Custom Design',
          rating: 5,
          feedback: 'Master Naveed\'s team recreated a luxury runway dress for me. The lace integrations and the fabric lining drape was exceptionally beautiful. Fully trustworthy!',
          approved: true,
          createdAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Farhan Saeed',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Got a bespoke jamawar prince coat stitched for a family function. The fit is absolutely crisp and the fabric alignment is perfect.',
          approved: true,
          createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sania Mirza',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'The raw silk straight shirt and digital printed dupatta finishing was excellent. Sizing was exactly according to my measurements card.',
          approved: true,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Shoaib Malik',
          dressType: 'Formal Wear',
          rating: 4,
          feedback: 'Great stitching for custom waistcoats. Clean, minimalist look with premium satin lining inside. Highly professional team.',
          approved: true,
          createdAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Sajal Aly',
          dressType: 'Bridal Wear',
          rating: 5,
          feedback: 'Stunning heavy bridal lehenga fitting! The weight was distributed beautifully across the waistband so it was extremely comfortable to wear.',
          approved: true,
          createdAt: new Date(Date.now() - 47 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Ahad Raza',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Excellent custom kurta pajama stitching. The collar stiffening is premium and doesn\'t lose shape even after multiple washes.',
          approved: true,
          createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Yumna Zaidi',
          dressType: 'Party Wear',
          rating: 5,
          feedback: 'The luxury chiffon frock was stitched beautifully with elegant gathers and perfect length. Master Naveed is highly professional and polite.',
          approved: true,
          createdAt: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Wahaj Ali',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'Ordered custom festive sherwani and inner cotton kurta. The shoulders are perfectly structured and the alignment is crisp.',
          approved: true,
          createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Ramsha Khan',
          dressType: 'Casual Wear',
          rating: 5,
          feedback: 'Love the simple everyday lawn stitching! The neckline designs are always unique and look very decent.',
          approved: true,
          createdAt: new Date(Date.now() - 51 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          name: 'Bilal Abbas',
          dressType: 'Formal Wear',
          rating: 5,
          feedback: 'The absolute pinnacle of custom tailoring in Lahore. Sizing is incredibly detailed, and the raw silk fabric has a beautiful posture. Highly satisfied.',
          approved: true,
          createdAt: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      for (const item of initialTestimonials) {
        await addDoc(collection(db, 'testimonials'), item);
      }
    }
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
}

// Call seed on import to verify empty state and seed
seedDatabaseIfEmpty();

export { db, auth };
