import { ExpenseItem, DecisionBucket } from '../types/expense';

export const SAMPLE_DATASETS: Record<string, { name: string; description: string; items: ExpenseItem[] }> = {
  freelancer: {
    name: "Freelance Tech Creator (2026)",
    description: "Cloud servers, AI subscriptions, unused gym memberships, and late night sushi.",
    items: [
      {
        id: "exp_1",
        date: "2026-10-02",
        merchant: "AWS Cloud Hosting (us-east-1)",
        amount: 284.50,
        originalCategory: "Hosting & Infrastructure",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "tax_deductible",
        suggestedReason: "Core developer infrastructure for client hosting.",
        status: "pending",
        avatar: "☁️",
        avatarMood: "robotic",
        storyQuote: "I host 14 Docker containers and 1 forgotten Kubernetes cluster. Feed me kilowatt-hours.",
        crossExamineQuestion: "What exactly is running on this cluster right now?",
        crossExamineAnswer: "Confession: 1 production client API, 4 abandoned hobby projects from 2024, and an idle Redis instance burning $12/month in pure memory standby!",
        verdictReaction: {
          tax_deductible: "100% Tax Write-Off approved! The IRS nods in server-room chill.",
          personal: "Personal? Are you hosting Minecraft servers for your nephews?",
          vampire_cancel: "Cluster terminated! You flagged $3,414/year in idle cloud compute to deprovision!",
          suspicious_flag: "Flagged! Did an intern spin up 40 GPU instances without telling you?"
        }
      },
      {
        id: "exp_2",
        date: "2026-10-03",
        merchant: "Planet Fitness Gym (Unattended since March)",
        amount: 49.99,
        originalCategory: "Health & Fitness",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "vampire_cancel",
        suggestedReason: "Recurring charge with 0 check-ins for 7 consecutive months.",
        status: "pending",
        avatar: "🏋️",
        avatarMood: "pleading",
        storyQuote: "Wait! Don't cancel me! You PROMISED you'd go on leg day! That was only 8 months ago!",
        crossExamineQuestion: "When was the last time the barcode on my keychain was scanned at your turnstile?",
        crossExamineAnswer: "Uh... March 12th, 2025. You walked in, grabbed a complimentary Tootsie Roll, felt intimidated by the squat rack, and left in 4 minutes flat.",
        verdictReaction: {
          tax_deductible: "Nice try! Gym memberships are not business write-offs, nice try gym bro.",
          personal: "Classified as Personal. Your wallet sheds a solitary tear every month.",
          vampire_cancel: "VAMPIRE SLAYED! Canceled unused gym membership. You just saved $599.88/year!",
          suspicious_flag: "Flagged. Truly suspicious how long this went unnoticed."
        }
      },
      {
        id: "exp_3",
        date: "2026-10-04",
        merchant: "Cursor AI / Pro Code Assistant",
        amount: 20.00,
        originalCategory: "Software",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "tax_deductible",
        suggestedReason: "Essential programming tool for code generation & pair programming.",
        status: "pending",
        avatar: "⚡",
        avatarMood: "smug",
        storyQuote: "I generate your full-stack apps while you sip iced matcha. I'm practically your co-founder.",
        crossExamineQuestion: "Did you actually write the code, or did you just hallucinate 800 lines of CSS?",
        crossExamineAnswer: "I solved 4 merge conflicts, auto-fixed 12 TypeScript generics, and prevented a production outage at 1 AM. I have earned every cent of this twenty dollars.",
        verdictReaction: {
          tax_deductible: "Deductible software tool! Direct business productivity deduction.",
          personal: "You code for fun? Still qualifies as a trade expense!",
          vampire_cancel: "Canceled? Back to writing raw assembly by candlelight then.",
          suspicious_flag: "Flagged? The AI will remember this slight."
        }
      },
      {
        id: "exp_4",
        date: "2026-10-05",
        merchant: "Uber Eats - Midnight Dragon Roll",
        amount: 48.75,
        originalCategory: "Food & Dining",
        suggestedBucket: "personal",
        suggestedReason: "Late-night personal dining (not a client meeting or business travel).",
        status: "pending",
        avatar: "🍣",
        avatarMood: "guilty",
        storyQuote: "Can we really argue that spicy tuna and tempura flakes at 2:14 AM was 'Essential R&D'?",
        crossExamineQuestion: "Was there a client present on this Zoom call during dinner?",
        crossExamineAnswer: "No, you were in sweatpants binge-watching cyberpunk anime with sauce on your hoodie. It was 100% personal bliss.",
        verdictReaction: {
          tax_deductible: "Auditor warning: Solitary late-night meals are not business meals without a client!",
          personal: "Filed as Personal expense. Delicious, but non-deductible.",
          vampire_cancel: "You cannot cancel sushi already digested into pure glucose.",
          suspicious_flag: "Flagged. That delivery fee alone was criminal."
        }
      },
      {
        id: "exp_5",
        date: "2026-10-06",
        merchant: "Duplicate Spotify Premium Family (Old Account)",
        amount: 19.99,
        originalCategory: "Entertainment",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "vampire_cancel",
        suggestedReason: "Duplicate charge detected: You already pay for Apple One Music bundle.",
        status: "pending",
        avatar: "🎵",
        avatarMood: "sneaky",
        storyQuote: "Shhh... I've been quietly streaming lo-fi chill beats into the void on your college email.",
        crossExamineQuestion: "Why did you charge me when Apple Music is already active?",
        crossExamineAnswer: "Because you set up autopay in 2021 with an old PayPal account and never checked the monthly PDF statement! Classic vampire trap!",
        verdictReaction: {
          tax_deductible: "Music streaming is not a freelance tax write-off (unless you're DJ Tiësto).",
          personal: "Kept as personal, but why pay twice for music?",
          vampire_cancel: "VAMPIRE SLAYED! Duplicate music subscription crushed. Saved $239.88/year!",
          suspicious_flag: "Flagged duplicate charge!"
        }
      },
      {
        id: "exp_6",
        date: "2026-10-07",
        merchant: "GitHub Enterprise & Copilot Seat",
        amount: 39.00,
        originalCategory: "Developer Tools",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "tax_deductible",
        suggestedReason: "Code repository & version control platform for production repos.",
        status: "pending",
        avatar: "🐙",
        avatarMood: "robotic",
        storyQuote: "I store all your git repos, pull requests, and git commits safely in the cloud.",
        crossExamineQuestion: "Can you prove business usage on this account?",
        crossExamineAnswer: "Over 842 commits this year across 12 private client repositories with active automated CI/CD deployment actions.",
        verdictReaction: {
          tax_deductible: "Direct Business Write-Off! Legitimate software development cost.",
          personal: "Personal? Your repos are open source or client deliverables!",
          vampire_cancel: "No! Deleting GitHub will freeze your CI/CD pipelines!",
          suspicious_flag: "Flagged for audit review."
        }
      },
      {
        id: "exp_7",
        date: "2026-10-08",
        merchant: "Unknown Merchant - BIZPAY_SERVICES_CY",
        amount: 499.00,
        originalCategory: "Miscellaneous",
        suggestedBucket: "suspicious_flag",
        suggestedReason: "Unrecognized offshore merchant with high dollar amount. Potential fraud.",
        status: "pending",
        avatar: "🕵️",
        avatarMood: "sneaky",
        storyQuote: "Greetings fellow human! I am totally a real business service from an offshore island. Move along!",
        crossExamineQuestion: "Where are your headquarters and what invoice number generated this charge?",
        crossExamineAnswer: "*sweats nervously in binary* ...Our headquarters is a mailbox in Nicosia, and our website was registered 4 days ago. Don't look too closely!",
        verdictReaction: {
          tax_deductible: "DO NOT WRITE OFF UNKNOWN OFFSHORE CHARGES! Audit danger!",
          personal: "Wait, do you actually remember buying this?",
          vampire_cancel: "Cancel attempted, but this looks like unauthorized fraud!",
          suspicious_flag: "CRITICAL CATCH! Flagged for bank chargeback & fraud investigation! Saved $499.00!"
        }
      },
      {
        id: "exp_8",
        date: "2026-10-09",
        merchant: "Figma Professional Annual License",
        amount: 144.00,
        originalCategory: "Design Software",
        isRecurring: true,
        recurringFrequency: "annual",
        suggestedBucket: "tax_deductible",
        suggestedReason: "UI/UX prototyping software used for client wireframes.",
        status: "pending",
        avatar: "🎨",
        avatarMood: "smug",
        storyQuote: "Auto-layout. Vector bezier curves. Interactive micro-animations. You cannot ship without me.",
        crossExamineQuestion: "Do you provide receipts with VAT/Tax registration numbers?",
        crossExamineAnswer: "Yes! Full enterprise VAT invoices stored in Settings > Billing. Clean compliance ready for your CPA.",
        verdictReaction: {
          tax_deductible: "Tax Deductible! Professional design software license.",
          personal: "Design tools for freelance apps are 100% business related.",
          vampire_cancel: "Canceled? Who will design the landing pages?",
          suspicious_flag: "Flagged for license review."
        }
      },
      {
        id: "exp_9",
        date: "2026-10-10",
        merchant: "Forgotten Adobe Creative Cloud (Stock 3D)",
        amount: 54.99,
        originalCategory: "Software",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "vampire_cancel",
        suggestedReason: "Add-on trial converted to full paid subscription 11 months ago with 0 assets downloaded.",
        status: "pending",
        avatar: "🧛",
        avatarMood: "sneaky",
        storyQuote: "I am Adobe's greatest creation: an obscure 3D asset tier you forgot you ever activated.",
        crossExamineQuestion: "How many 3D assets have been downloaded from this subscription in the last 180 days?",
        crossExamineAnswer: "Zero. Exactly 0 assets. You clicked 'Free Trial' in November 2024 to download one wireframe cup, and forgot to click the 9-step cancel button!",
        verdictReaction: {
          tax_deductible: "Even if deductible, why pay for software you don't open?",
          personal: "Classified as Personal zombie fee.",
          vampire_cancel: "VAMPIRE SLAYED! Slayed zombie Adobe add-on! That saves an incredible $659.88/year!",
          suspicious_flag: "Flagged predatory dark pattern recurring fee."
        }
      },
      {
        id: "exp_10",
        date: "2026-10-11",
        merchant: "Starbucks Reserve - Triple Oat Latte",
        amount: 9.75,
        originalCategory: "Coffee & Food",
        suggestedBucket: "personal",
        suggestedReason: "Standard personal coffee expense.",
        status: "pending",
        avatar: "☕",
        avatarMood: "guilty",
        storyQuote: "Yes, I cost $9.75. Yes, I was 70% oat milk foam. But I kept you awake through 3 bug fixes.",
        crossExamineQuestion: "Were you consumed in a designated client meeting room?",
        crossExamineAnswer: "Nope. You ordered me on the Starbucks mobile app while still half-asleep on your living room couch.",
        verdictReaction: {
          tax_deductible: "IRS Rule: Your morning solitary coffee is a personal living expense.",
          personal: "Filed as Personal expense. Fuel for the soul, but not a write-off.",
          vampire_cancel: "Can't cancel caffeine addictions through software (yet).",
          suspicious_flag: "Flagged for highway robbery latte pricing."
        }
      },
      {
        id: "exp_11",
        date: "2026-10-12",
        merchant: "OpenAI API Usage (LLM Tokens)",
        amount: 88.40,
        originalCategory: "AI Infrastructure",
        suggestedBucket: "tax_deductible",
        suggestedReason: "API consumption for development, embeddings, and client agent prototypes.",
        status: "pending",
        avatar: "🤖",
        avatarMood: "robotic",
        storyQuote: "I ingested 14,000,000 tokens for you this month. Temperature 0.7, top_p 0.9.",
        crossExamineQuestion: "Did these tokens power paying client projects?",
        crossExamineAnswer: "Yes, 85% of token volume was for automated customer inquiry processing and schema generation for the Apex client.",
        verdictReaction: {
          tax_deductible: "100% Tax Deductible compute expense for AI software development!",
          personal: "Unless you used all 14M tokens to write pirate poetry, this is business.",
          vampire_cancel: "Token pipeline severed!",
          suspicious_flag: "Flagged for API key audit."
        }
      },
      {
        id: "exp_12",
        date: "2026-10-13",
        merchant: "Zoom Video Pro (Monthly)",
        amount: 15.99,
        originalCategory: "Communications",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "tax_deductible",
        suggestedReason: "Client video conferencing exceeding the 40-minute free limit.",
        status: "pending",
        avatar: "📹",
        avatarMood: "smug",
        storyQuote: "You're on mute. Can everyone see my screen? Let's take this offline.",
        crossExamineQuestion: "Could you have used Google Meet for free?",
        crossExamineAnswer: "Your corporate enterprise clients refuse Google Meet and insist on recording Zoom links with cloud transcripts. Necessary business tool!",
        verdictReaction: {
          tax_deductible: "Tax deductible communication tool for client meetings.",
          personal: "Classified personal.",
          vampire_cancel: "Back to 40-minute disconnects!",
          suspicious_flag: "Flagged."
        }
      },
      {
        id: "exp_13",
        date: "2026-10-14",
        merchant: "Duplicate Cloud Backup Service (Dropbox)",
        amount: 11.99,
        originalCategory: "Storage",
        isRecurring: true,
        recurringFrequency: "monthly",
        suggestedBucket: "vampire_cancel",
        suggestedReason: "Redundant storage: Google One and iCloud 2TB already active.",
        status: "pending",
        avatar: "📦",
        avatarMood: "pleading",
        storyQuote: "I hold your high school graduation photos and 2 abandoned Python scripts from 2018!",
        crossExamineQuestion: "When was the last file uploaded to this Dropbox?",
        crossExamineAnswer: "August 2022. You moved everything to Google Drive 2 years ago and just let this $11.99 charge recur 26 times!",
        verdictReaction: {
          tax_deductible: "Deductible? You have 3 overlapping cloud storages!",
          personal: "Personal clutter.",
          vampire_cancel: "VAMPIRE SLAYED! Canceled redundant cloud storage! Saved $143.88/year!",
          suspicious_flag: "Flagged redundant storage fee."
        }
      },
      {
        id: "exp_14",
        date: "2026-10-15",
        merchant: "Apple Developer Program Annual Fee",
        amount: 99.00,
        originalCategory: "Professional Licensing",
        isRecurring: true,
        recurringFrequency: "annual",
        suggestedBucket: "tax_deductible",
        suggestedReason: "Required developer license to publish client iOS/macOS apps on App Store.",
        status: "pending",
        avatar: "🍎",
        avatarMood: "smug",
        storyQuote: "App Store code signing certificates don't come free, developer.",
        crossExamineQuestion: "Are client apps actively signed by this certificate?",
        crossExamineAnswer: "Yes, 3 active iOS client builds rely on this Team ID for provisioning profiles.",
        verdictReaction: {
          tax_deductible: "Legitimate professional membership and software publishing deduction!",
          personal: "Definitely business related.",
          vampire_cancel: "Careful! Canceling removes your published apps from TestFlight!",
          suspicious_flag: "Flagged."
        }
      },
      {
        id: "exp_15",
        date: "2026-10-16",
        merchant: "DoorDash - Chipotle Double Guac",
        amount: 27.60,
        originalCategory: "Food & Dining",
        suggestedBucket: "personal",
        suggestedReason: "Personal meal during evening coding session.",
        status: "pending",
        avatar: "🌯",
        avatarMood: "guilty",
        storyQuote: "Yes, the guacamole was an extra $3.50. You know in your heart it was worth it.",
        crossExamineQuestion: "Is guacamole a tax-deductible asset under IRS Section 179?",
        crossExamineAnswer: "The IRS has explicitly ruled that avocados are a consumable luxury, not depreciable software machinery.",
        verdictReaction: {
          tax_deductible: "Non-deductible personal meal. But delicious.",
          personal: "Classified as Personal dining.",
          vampire_cancel: "Burrito cannot be refunded.",
          suspicious_flag: "Flagged."
        }
      }
    ]
  },
  startup: {
    name: "Seed Stage SaaS Startup",
    description: "Cloud compute bloat, abandoned dev tools, catering, and investor dinner expenses.",
    items: [
      {
        id: "st_1",
        date: "2026-10-01",
        merchant: "Vercel Enterprise Team Tier",
        amount: 150.00,
        originalCategory: "Infrastructure",
        isRecurring: true,
        suggestedBucket: "tax_deductible",
        suggestedReason: "Frontend hosting for marketing site and web app.",
        status: "pending",
        avatar: "▲",
        avatarMood: "smug",
        storyQuote: "Edge networks in 40 regions. Zero-config deploys in 8 seconds flat.",
        crossExamineQuestion: "Are all team members actively deploying?",
        crossExamineAnswer: "6 frontend developers pushed 94 PRs this month. Mission-critical infrastructure.",
        verdictReaction: {
          tax_deductible: "Approved business infrastructure deduction.",
          personal: "Not personal.",
          vampire_cancel: "Don't take the main site down!",
          suspicious_flag: "Flagged."
        }
      },
      {
        id: "st_2",
        date: "2026-10-02",
        merchant: "Unused Datadog APM Ingestion Overages",
        amount: 620.00,
        originalCategory: "Monitoring",
        isRecurring: true,
        suggestedBucket: "vampire_cancel",
        suggestedReason: "Huge overage bill caused by unthrottled debug log ingestion.",
        status: "pending",
        avatar: "🐶",
        avatarMood: "sneaky",
        storyQuote: "You left verbose debug logs on in staging. I charged you for every single newline.",
        crossExamineQuestion: "Why did our bill jump by 400% this month?",
        crossExamineAnswer: "Someone enabled `DEBUG=*` in staging Kubernetes and pumped 80 gigabytes of useless stack traces into APM indexes!",
        verdictReaction: {
          tax_deductible: "Deductible, but an enormous waste of startup runway!",
          personal: "Not personal.",
          vampire_cancel: "VAMPIRE SLAYED! Throttled Datadog log ingestion! Saves a massive $7,440.00/year!",
          suspicious_flag: "Flagged for infrastructure budget review!"
        }
      },
      {
        id: "st_3",
        date: "2026-10-04",
        merchant: "Slack Business+ Tier (12 Inactive Ex-Employee Seats)",
        amount: 180.00,
        originalCategory: "Collaboration",
        isRecurring: true,
        suggestedBucket: "vampire_cancel",
        suggestedReason: "Still paying for 12 departed contractors and interns who haven't logged in.",
        status: "pending",
        avatar: "💬",
        avatarMood: "sneaky",
        storyQuote: "Those summer interns from 2024? You are still paying $15/month for each of their empty seats.",
        crossExamineQuestion: "Who are these 12 accounts?",
        crossExamineAnswer: "Former interns whose laptops were turned in 14 months ago. HR never deprovisioned their Slack accounts!",
        verdictReaction: {
          tax_deductible: "Deductible, but you're bleeding cash on ghost seats!",
          personal: "Not personal.",
          vampire_cancel: "VAMPIRE SLAYED! Deprovisioned inactive Slack seats. Saved $2,160.00/year!",
          suspicious_flag: "Flagged ghost employee seat billing."
        }
      },
      {
        id: "st_4",
        date: "2026-10-06",
        merchant: "Blue Bottle Coffee Catering for Team",
        amount: 115.00,
        originalCategory: "Office & Team",
        suggestedBucket: "tax_deductible",
        suggestedReason: "De minimis employee fringe benefit / team planning session coffee.",
        status: "pending",
        avatar: "☕",
        avatarMood: "pleading",
        storyQuote: "The engineering sprint planning meeting required single-origin pour-overs.",
        crossExamineQuestion: "Was the entire team present?",
        crossExamineAnswer: "Yes, 8 engineers and 2 product designers attended the quarterly roadmap sprint.",
        verdictReaction: {
          tax_deductible: "Legitimate team meeting and employee perk deduction (50-100%).",
          personal: "Classified personal.",
          vampire_cancel: "Team will revolt without coffee.",
          suspicious_flag: "Flagged."
        }
      },
      {
        id: "st_5",
        date: "2026-10-08",
        merchant: "Suspicious Double Charge: Notion Team Plan",
        amount: 96.00,
        originalCategory: "Productivity",
        suggestedBucket: "suspicious_flag",
        suggestedReason: "Billed twice in 48 hours for the identical workspace ID.",
        status: "pending",
        avatar: "📝",
        avatarMood: "sneaky",
        storyQuote: "Oops! We charged you on Monday, and then again on Wednesday just in case.",
        crossExamineQuestion: "Why does transaction ID match duplicate invoice #N-8422?",
        crossExamineAnswer: "System glitch on billing server caused a duplicate renewal event. Legitimate dispute!",
        verdictReaction: {
          tax_deductible: "Don't pay duplicate invoices!",
          personal: "Not personal.",
          vampire_cancel: "Flagged for refund instead.",
          suspicious_flag: "DOUBLE CHARGE CAUGHT! Saved $96.00 on duplicate billing!"
        }
      }
    ]
  }
};

export function parseCSVToExpenses(csvText: string): ExpenseItem[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  
  let dateIdx = header.findIndex(h => h.includes('date') || h.includes('time'));
  let merchantIdx = header.findIndex(h => h.includes('merchant') || h.includes('desc') || h.includes('payee') || h.includes('name') || h.includes('title'));
  let amountIdx = header.findIndex(h => h.includes('amount') || h.includes('total') || h.includes('debit') || h.includes('price') || h.includes('cost'));
  let categoryIdx = header.findIndex(h => h.includes('category') || h.includes('type') || h.includes('tag'));

  if (dateIdx === -1) dateIdx = 0;
  if (merchantIdx === -1) merchantIdx = Math.min(1, header.length - 1);
  if (amountIdx === -1) amountIdx = Math.min(2, header.length - 1);

  const items: ExpenseItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanRow = row.map(cell => cell.trim().replace(/^"|"$/g, ''));

    if (cleanRow.length <= Math.max(dateIdx, merchantIdx, amountIdx)) continue;

    const date = cleanRow[dateIdx] || new Date().toISOString().split('T')[0];
    const merchant = cleanRow[merchantIdx] || `Expense #${i}`;
    const rawAmount = cleanRow[amountIdx] || '0';
    const amount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]+/g, ''))) || 0;
    const originalCategory = categoryIdx !== -1 ? cleanRow[categoryIdx] : 'Uncategorized';

    if (amount === 0) continue;

    const classified = classifyExpenseHeuristic(merchant, amount, originalCategory);

    items.push({
      id: `csv_${i}_${Date.now().toString(36)}`,
      date,
      merchant,
      amount,
      originalCategory,
      isRecurring: classified.isRecurring,
      suggestedBucket: classified.suggestedBucket,
      suggestedReason: classified.suggestedReason,
      status: 'pending',
      avatar: classified.avatar,
      avatarMood: classified.avatarMood,
      storyQuote: classified.storyQuote,
      crossExamineQuestion: "Can you provide documentation or business rationale for this expense?",
      crossExamineAnswer: `Direct transaction of $${amount.toFixed(2)} recorded in CSV ledger on ${date}.`,
      verdictReaction: classified.verdictReaction
    });
  }

  return items;
}

function classifyExpenseHeuristic(merchant: string, amount: number, category: string): {
  suggestedBucket: DecisionBucket;
  suggestedReason: string;
  isRecurring: boolean;
  avatar: string;
  avatarMood: ExpenseItem['avatarMood'];
  storyQuote: string;
  verdictReaction: ExpenseItem['verdictReaction'];
} {
  const m = merchant.toLowerCase();

  // 1. Vampire Subscriptions
  if (
    ['gym', 'fitness', 'planet fitness', 'equinox', 'duplicate', 'unused', 'forgotten', 'trial', 'hulu', 'netflix', 'disney', 'paramount', 'peacock'].some(k => m.includes(k)) ||
    (amount < 30 && ['spotify', 'apple.com/bill', 'audible', 'patreon', 'sub'].some(k => m.includes(k)))
  ) {
    return {
      suggestedBucket: 'vampire_cancel',
      suggestedReason: 'Recurring lifestyle or entertainment subscription with low utilization.',
      isRecurring: true,
      avatar: '🧛',
      avatarMood: 'sneaky',
      storyQuote: `I'm a recurring charge of $${amount.toFixed(2)}/month quietly sipping from your checking account while you sleep!`,
      verdictReaction: {
        tax_deductible: 'Not deductible as a business expense.',
        personal: 'Filed as personal expense.',
        vampire_cancel: `VAMPIRE SLAYED! Flagged for cancellation! Saves $${(amount * 12).toFixed(2)}/year!`,
        suspicious_flag: 'Flagged for review.'
      }
    };
  }

  // 2. Tax Deductible Business Expenses
  if (
    ['aws', 'amazon web services', 'google cloud', 'gcp', 'azure', 'vercel', 'github', 'cursor', 'openai', 'anthropic', 'digitalocean', 'cloudflare', 'figma', 'jetbrains', 'adobe', 'slack', 'zoom', 'notion', 'apple developer', 'domain', 'namecheap', 'godaddy', 'mailchimp', 'stripe'].some(k => m.includes(k))
  ) {
    return {
      suggestedBucket: 'tax_deductible',
      suggestedReason: 'Standard developer / software technology business infrastructure.',
      isRecurring: true,
      avatar: '⚡',
      avatarMood: 'robotic',
      storyQuote: `Enterprise developer tool powering your production workflows ($${amount.toFixed(2)}).`,
      verdictReaction: {
        tax_deductible: `Tax write-off confirmed! Saved ~$${(amount * 0.30).toFixed(2)} in taxes.`,
        personal: 'Marked personal.',
        vampire_cancel: 'Warning: Canceling core tools may disrupt your work!',
        suspicious_flag: 'Flagged for audit.'
      }
    };
  }

  // 3. Suspicious / Fraud
  if (amount > 400 && ['unknown', 'crypto', 'wire', 'transfer', 'offshore', 'b2b_intl'].some(k => m.includes(k))) {
    return {
      suggestedBucket: 'suspicious_flag',
      suggestedReason: 'High value transaction from an unrecognized entity. Potential fraud.',
      isRecurring: false,
      avatar: '🕵️',
      avatarMood: 'sneaky',
      storyQuote: `Unusual large charge of $${amount.toFixed(2)}. Do you really recognize me?`,
      verdictReaction: {
        tax_deductible: 'High audit risk! Verify with receipts before deducting.',
        personal: 'Marked personal.',
        vampire_cancel: 'Canceled.',
        suspicious_flag: `CRITICAL CATCH! Flagged for bank fraud investigation! Protected $${amount.toFixed(2)}!`
      }
    };
  }

  // 4. Default: Personal
  return {
    suggestedBucket: 'personal',
    suggestedReason: 'Personal food, retail, or entertainment spending.',
    isRecurring: false,
    avatar: '🛍️',
    avatarMood: 'guilty',
    storyQuote: `I'm a personal lifestyle purchase ($${amount.toFixed(2)}).`,
    verdictReaction: {
      tax_deductible: 'Non-deductible personal expense.',
      personal: 'Filed accurately as Personal.',
      vampire_cancel: 'Cannot cancel past purchases.',
      suspicious_flag: 'Flagged for review.'
    }
  };
}

export function exportExpensesToCSV(items: ExpenseItem[]): string {
  const headers = [
    'Date',
    'Merchant',
    'Amount',
    'Original_Category',
    'Audit_Status',
    'Decision',
    'Tax_Deductible',
    'Annual_Recurring_Savings_Flagged',
    'Audit_Notes'
  ];

  const rows = items.map(item => {
    const isTaxDeductible = item.decision === 'tax_deductible' ? 'YES' : 'NO';
    const savings = item.annualSavings ? `$${item.annualSavings.toFixed(2)}` : '$0.00';
    const decisionLabel = item.decision ? item.decision.toUpperCase() : 'PENDING';

    return [
      `"${item.date}"`,
      `"${item.merchant.replace(/"/g, '""')}"`,
      item.amount.toFixed(2),
      `"${(item.originalCategory || '').replace(/"/g, '""')}"`,
      item.status.toUpperCase(),
      `"${decisionLabel}"`,
      `"${isTaxDeductible}"`,
      `"${savings}"`,
      `"${(item.suggestedReason || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function generateCancellationEmailTemplate(merchant: string, amount: number): string {
  return `To: support@${merchant.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
Subject: Immediate Cancellation Request - Account Subscription ($${amount.toFixed(2)}/mo)

Dear Customer Support,

I am writing to formally request the immediate cancellation of my recurring subscription for "${merchant}" with the billing amount of $${amount.toFixed(2)}.

Please process this cancellation immediately and ensure no further recurring charges are billed to my card or payment method on file. Kindly provide written confirmation of cancellation and effective termination date.

Thank you,
Account Holder`;
}
