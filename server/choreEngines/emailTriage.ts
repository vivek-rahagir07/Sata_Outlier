import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { undoManager } from '../undoManager.js';

export interface EmailChoreItem {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  date: string;
  category: 'spam' | 'newsletter' | 'cold_sales' | 'receipt' | 'urgent_work';
  recommendedAction: 'trash_unsubscribe' | 'archive' | 'star_keep';
  enemyType: 'vampire' | 'mosquito' | 'robot' | 'gargoyle' | 'vip_angel';
  health: number;
  xp: number;
  originalPath?: string;
  status: 'unread' | 'archived' | 'trashed' | 'starred';
}

export class EmailTriage {
  private emails: Map<string, EmailChoreItem> = new Map();
  private storageDir: string = '';
  private blockedDomains: Set<string> = new Set();

  initialize(dirPath?: string) {
    this.emails.clear();
    this.storageDir = dirPath || path.join(process.cwd(), 'chaos_sandbox', 'inbox_export');

    if (fs.existsSync(this.storageDir)) {
      this.loadFromDirectory(this.storageDir);
    } else {
      this.generateDefaultInbox();
    }
  }

  loadFromDirectory(dirPath: string) {
    this.storageDir = dirPath;
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!file.endsWith('.eml') && !file.endsWith('.json')) continue;
      const fullPath = path.join(dirPath, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        let parsed: any;
        if (file.endsWith('.json')) {
          parsed = JSON.parse(content);
        } else {
          // Basic EML header parser
          const lines = content.split('\n');
          let sender = 'Unknown Sender';
          let subject = 'No Subject';
          let date = new Date().toLocaleDateString();
          let body = '';
          let isBody = false;

          for (const line of lines) {
            if (isBody) {
              body += line + ' ';
              if (body.length > 200) break;
            } else if (line.trim() === '') {
              isBody = true;
            } else if (line.toLowerCase().startsWith('from:')) {
              sender = line.slice(5).trim();
            } else if (line.toLowerCase().startsWith('subject:')) {
              subject = line.slice(8).trim();
            } else if (line.toLowerCase().startsWith('date:')) {
              date = line.slice(5).trim();
            }
          }
          parsed = { sender, subject, date, preview: body.slice(0, 150) };
        }

        const id = 'eml_' + crypto.randomUUID().slice(0, 8);
        const classified = this.classifyEmail(parsed.sender, parsed.subject, parsed.preview);
        const item: EmailChoreItem = {
          id,
          sender: parsed.sender,
          senderEmail: this.extractEmail(parsed.sender),
          subject: parsed.subject,
          preview: parsed.preview || 'No preview available',
          date: parsed.date || 'Recent',
          category: classified.category,
          recommendedAction: classified.recommendedAction,
          enemyType: classified.enemyType,
          health: classified.health,
          xp: classified.xp,
          originalPath: fullPath,
          status: 'unread'
        };
        this.emails.set(id, item);
      } catch {
        continue;
      }
    }

    if (this.emails.size === 0) {
      this.generateDefaultInbox();
    }
  }

  generateDefaultInbox() {
    const templates = [
      { sender: 'Domino\'s Deals <deals@dominos-promos.com>', subject: '🍕 50% OFF ANY LARGE PIZZA - TODAY ONLY!', preview: 'Hungry? Satisfy your cravings with our handcrafted crusts and unlimited toppings. Click to claim code CRAVE50 before midnight.', cat: 'spam', act: 'trash_unsubscribe', enemy: 'mosquito', xp: 120 },
      { sender: 'LinkedIn Job Alerts <jobs-noreply@linkedin.com>', subject: '34 new jobs match your profile: "Chief AI Architect"', preview: 'See who is hiring in your area. Companies are looking for skills like TypeScript, Agentic AI, and React.', cat: 'newsletter', act: 'trash_unsubscribe', enemy: 'robot', xp: 150 },
      { sender: 'Medium Daily Digest <digest@medium.com>', subject: 'Why 99% of developers are using this 1 secret React trick', preview: 'Top stories for you today curated from your favorite authors on system design, web performance, and tech leadership.', cat: 'newsletter', act: 'trash_unsubscribe', enemy: 'robot', xp: 130 },
      { sender: 'Gavin Belson <ceo@hooli-enterprise.com>', subject: 'URGENT: Executive Board Presentation Needs Revisions', preview: 'We need the final deck adjusted for the board meeting at 2 PM. Please ensure the cloud compute projections are verified.', cat: 'urgent_work', act: 'star_keep', enemy: 'vip_angel', xp: 350 },
      { sender: 'Uber Receipts <uber.receipts@uber.com>', subject: 'Your trip with Uber on Friday night ($34.82)', preview: 'Total: $34.82. Trip details: Pickup at Financial District, dropoff at Mission. Thank you for riding with Uber.', cat: 'receipt', act: 'archive', enemy: 'gargoyle', xp: 200 },
      { sender: 'Substack Weekly <noreply@substack.com>', subject: 'Issue #184: The Great AI Paradigm Shift of 2026', preview: 'In this week’s issue, we break down autonomous agent swarms, local LLM quantization, and the future of work.', cat: 'newsletter', act: 'trash_unsubscribe', enemy: 'vampire', xp: 160 },
      { sender: 'Chad Outreach <chad@growthhacks-solutions-b2b.io>', subject: 'Quick question regarding your outbound pipeline?', preview: 'Hey there! Noticed your profile and wondered if you are currently hitting your Q4 ARR targets? We guarantee 40 leads/week.', cat: 'cold_sales', act: 'trash_unsubscribe', enemy: 'mosquito', xp: 180 },
      { sender: 'GitHub <notifications@github.com>', subject: '[Security] Dependabot alert: Lodash vulnerability patched', preview: 'A high severity vulnerability was detected in repository acme/backend. We recommend upgrading to version 4.17.21.', cat: 'urgent_work', act: 'star_keep', enemy: 'vip_angel', xp: 280 },
      { sender: 'Target Specials <circle@weekly-ads-target.com>', subject: 'Weekly Ad: Save big on home decor & seasonal essentials!', preview: 'Explore fresh spring arrivals and exclusive member discounts this week only. RedCard members save an extra 5%.', cat: 'spam', act: 'trash_unsubscribe', enemy: 'mosquito', xp: 110 },
      { sender: 'AWS Billing <no-reply-aws@amazon.com>', subject: 'Amazon Web Services Invoice #8492019 ($42.15)', preview: 'Your monthly invoice for AWS services is now available in the billing dashboard. Charges will be billed to your card.', cat: 'receipt', act: 'archive', enemy: 'gargoyle', xp: 220 },
      { sender: 'Grammarly Insights <insights@grammarly.com>', subject: 'Your Weekly Writing Stats: You were 94% more productive!', preview: 'You wrote 24,190 words this week. Your top tone was Confident, followed by Direct and Friendly.', cat: 'newsletter', act: 'trash_unsubscribe', enemy: 'robot', xp: 140 },
      { sender: 'Coursera <recommendations@coursera.org>', subject: 'Flash Sale: Learn Deep Learning from Stanford for $19', preview: 'Enhance your career credentials with professional certificates in Machine Learning, Cloud Architecture, and Data Science.', cat: 'spam', act: 'trash_unsubscribe', enemy: 'mosquito', xp: 130 },
      { sender: 'Slack Notifications <feedback@slack.com>', subject: 'Unread mentions in #engineering-war-room', preview: 'Sarah: "@channel does anyone know why the production deploy pipeline is stalled on step 4?"', cat: 'urgent_work', act: 'star_keep', enemy: 'vip_angel', xp: 300 },
      { sender: 'Steam Specials <noreply@steampowered.com>', subject: 'An item on your wishlist is on sale! 75% OFF', preview: 'Cyberpunk RPG 2088 is currently on sale for $14.99 until Thursday. Click here to purchase on the Steam store.', cat: 'spam', act: 'trash_unsubscribe', enemy: 'mosquito', xp: 150 },
      { sender: 'Credit Karma <alerts@creditkarma.com>', subject: 'New inquiry reported on your credit report', preview: 'TransUnion reported a change to your credit file. Log into your account to review this recent activity.', cat: 'urgent_work', act: 'star_keep', enemy: 'vip_angel', xp: 250 }
    ];

    for (const t of templates) {
      const id = 'eml_' + crypto.randomUUID().slice(0, 8);
      this.emails.set(id, {
        id,
        sender: t.sender,
        senderEmail: this.extractEmail(t.sender),
        subject: t.subject,
        preview: t.preview,
        date: 'Today',
        category: t.cat as any,
        recommendedAction: t.act as any,
        enemyType: t.enemy as any,
        health: t.cat === 'urgent_work' ? 250 : 100,
        xp: t.xp,
        status: 'unread'
      });
    }
  }

  private extractEmail(sender: string): string {
    const match = sender.match(/<([^>]+)>/);
    return match ? match[1] : sender.trim();
  }

  private classifyEmail(sender: string, subject: string, preview: string): {
    category: EmailChoreItem['category'];
    recommendedAction: EmailChoreItem['recommendedAction'];
    enemyType: EmailChoreItem['enemyType'];
    health: number;
    xp: number;
  } {
    const text = `${sender} ${subject} ${preview}`.toLowerCase();

    if (['urgent', 'outage', 'security alert', 'ceo', 'board', 'asap', 'broken', 'production'].some(w => text.includes(w))) {
      return { category: 'urgent_work', recommendedAction: 'star_keep', enemyType: 'vip_angel', health: 250, xp: 350 };
    }
    if (['receipt', 'invoice', 'order confirmed', 'billing', 'payment', 'charged'].some(w => text.includes(w))) {
      return { category: 'receipt', recommendedAction: 'archive', enemyType: 'gargoyle', health: 150, xp: 200 };
    }
    if (['sales', 'b2b', 'quick question', 'pipeline', 'growth', 'demo', 'call next week'].some(w => text.includes(w))) {
      return { category: 'cold_sales', recommendedAction: 'trash_unsubscribe', enemyType: 'mosquito', health: 100, xp: 180 };
    }
    if (['newsletter', 'digest', 'weekly', 'top stories', 'issue #', 'roundup', 'substack'].some(w => text.includes(w))) {
      return { category: 'newsletter', recommendedAction: 'trash_unsubscribe', enemyType: 'vampire', health: 120, xp: 150 };
    }
    return { category: 'spam', recommendedAction: 'trash_unsubscribe', enemyType: 'mosquito', health: 90, xp: 120 };
  }

  getEmails(): EmailChoreItem[] {
    return Array.from(this.emails.values()).filter(e => e.status === 'unread');
  }

  executeTriage(id: string, action: 'trash_unsubscribe' | 'archive' | 'star_keep', dryRun: boolean): {
    success: boolean;
    summary: string;
    action: string;
    xpGained: number;
    blockedDomain?: string;
  } {
    const email = this.emails.get(id);
    if (!email) {
      return { success: false, summary: 'Email not found', action, xpGained: 0 };
    }

    const domain = email.senderEmail.split('@')[1] || '';

    if (action === 'trash_unsubscribe') {
      email.status = 'trashed';
      if (domain && !domain.includes('gmail.com') && !domain.includes('yahoo.com') && !domain.includes('outlook.com')) {
        this.blockedDomains.add(domain);
        this.saveFiltersToDisk();
      }

      if (!dryRun && email.originalPath && fs.existsSync(email.originalPath)) {
        const trashDir = path.join(path.dirname(email.originalPath), 'Trashed_Emails');
        if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir, { recursive: true });
        const dest = path.join(trashDir, path.basename(email.originalPath));
        fs.renameSync(email.originalPath, dest);

        undoManager.record({
          id: crypto.randomUUID(),
          choreType: 'email',
          timestamp: Date.now(),
          summary: `Vaporized & Unsubscribed from ${email.senderEmail}`,
          revertType: 'move_file',
          revertData: { fromPath: email.originalPath, toPath: dest }
        });
      }

      return {
        success: true,
        summary: `Vaporized email from ${email.sender.split('<')[0].trim()} and generated auto-unsubscribe rule!`,
        action,
        xpGained: email.xp,
        blockedDomain: domain
      };
    } else if (action === 'archive') {
      email.status = 'archived';
      if (!dryRun && email.originalPath && fs.existsSync(email.originalPath)) {
        const archiveDir = path.join(path.dirname(email.originalPath), 'Archived_Emails');
        if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
        const dest = path.join(archiveDir, path.basename(email.originalPath));
        fs.renameSync(email.originalPath, dest);

        undoManager.record({
          id: crypto.randomUUID(),
          choreType: 'email',
          timestamp: Date.now(),
          summary: `Archived email "${email.subject.slice(0, 30)}..."`,
          revertType: 'move_file',
          revertData: { fromPath: email.originalPath, toPath: dest }
        });
      }

      return {
        success: true,
        summary: `Archived to records: "${email.subject.slice(0, 35)}..."`,
        action,
        xpGained: email.xp
      };
    } else {
      email.status = 'starred';
      return {
        success: true,
        summary: `Starred priority message: "${email.subject.slice(0, 35)}..."`,
        action,
        xpGained: email.xp
      };
    }
  }

  private saveFiltersToDisk() {
    try {
      const filtersPath = path.join(process.cwd(), 'chaos_sandbox', 'gmail_unsubscribe_filters.xml');
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom" xmlns:apps="http://schemas.google.com/apps/2006">\n';
      let entries = '';
      for (const domain of this.blockedDomains) {
        entries += `  <entry>\n    <category term="filter"></category>\n    <apps:property name="from" value="*@${domain}"/>\n    <apps:property name="shouldTrash" value="true"/>\n    <apps:property name="shouldNeverSpam" value="false"/>\n  </entry>\n`;
      }
      const xmlFooter = '</feed>';
      const dir = path.dirname(filtersPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filtersPath, xmlHeader + entries + xmlFooter, 'utf-8');
    } catch {
      // Ignore filter writing failures
    }
  }

  getBlockedDomains(): string[] {
    return Array.from(this.blockedDomains);
  }
}

export const emailTriage = new EmailTriage();
