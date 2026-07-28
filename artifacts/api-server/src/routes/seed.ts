import { Router } from 'express';
import { db, postsTable, mcqsTable } from '@workspace/db';

const router = Router();

// POST /api/seed  (idempotent — only seeds if tables are empty)
router.post('/seed', async (_req, res) => {
  try {
    const existingPosts = await db.select().from(postsTable).limit(1);
    const existingMcqs  = await db.select().from(mcqsTable).limit(1);

    if (existingPosts.length && existingMcqs.length) {
      res.json({ message: 'Already seeded', skipped: true });
      return;
    }

    if (!existingPosts.length) {
      await db.insert(postsTable).values([
        {
          title: 'Understanding the Preamble of the Indian Constitution',
          slug: 'preamble-of-indian-constitution',
          category: 'GS 2',
          content: `## The Preamble: Soul of the Constitution\n\nThe Preamble of the Indian Constitution declares India to be a **Sovereign, Socialist, Secular, Democratic Republic**.\n\n### Key Terms\n\n- **Sovereign** — India is free from any external authority.\n- **Socialist** — Added by the 42nd Amendment (1976). Aims for equitable distribution of resources.\n- **Secular** — State has no official religion and treats all religions equally.\n- **Democratic** — Government derives its authority from the will of the people.\n- **Republic** — Elected head of state (President), not a hereditary monarch.\n\n### The Four Objectives\n\n1. **Justice** — Social, Economic, Political\n2. **Liberty** — of thought, expression, belief, faith, and worship\n3. **Equality** — of status and opportunity\n4. **Fraternity** — assuring dignity of the individual\n\n> The Preamble is **not enforceable** by courts but it is used to interpret ambiguous constitutional provisions (Kesavananda Bharati case, 1973).\n\n### Previous Year Question (2020)\nWhich one of the following objectives is NOT embodied in the Preamble to the Constitution of India?\n*(A) Liberty of thought*\n*(B) Economic liberty ✓*\n*(C) Liberty of expression*\n*(D) Liberty of belief*`,
          tags: ['Polity', 'Constitution', 'Preamble', 'GS2'],
          pdfUrl: null,
          publishedAt: new Date('2025-01-15'),
        },
        {
          title: 'Daily Current Affairs – Climate Finance & COP Outcomes',
          slug: 'daily-ca-climate-finance-cop',
          category: 'Daily Current Affairs',
          content: `## Climate Finance: Key Developments\n\n### New Collective Quantified Goal (NCQG)\n\nAt COP29 in Baku, developed nations agreed to mobilise **$300 billion per year** by 2035 for developing countries' climate action — up from the earlier $100 billion pledge.\n\n### India's Position\n\n- India pushed for **$1 trillion/year** as a more realistic figure.\n- Emphasised that climate finance should be **grant-based**, not loans.\n- Called for technology transfer alongside finance.\n\n### Loss & Damage Fund\n\n- Operationalised at COP27 (Sharm el-Sheikh, 2022).\n- Hosted by the **World Bank** on an interim basis.\n- Focuses on addressing irreversible impacts of climate change.\n\n### Key Terms to Remember\n\n| Term | Meaning |\n|------|---------|\n| Mitigation | Reducing greenhouse gas emissions |\n| Adaptation | Adjusting to current/future climate effects |\n| Loss & Damage | Dealing with unavoidable climate impacts |\n| Carbon Credits | Tradeable certificates for emission reductions |\n\n### UPSC Relevance\nGS 3: Environment, International climate negotiations, India's commitments (NDCs, Net Zero 2070).`,
          tags: ['Environment', 'Climate Change', 'COP', 'International Relations', 'PIB'],
          pdfUrl: null,
          publishedAt: new Date('2025-07-20'),
        },
        {
          title: "India's Fiscal Federalism \u2013 Devolution and Finance Commissions",
          slug: 'fiscal-federalism-finance-commissions',
          category: 'GS 3',
          content: `## Fiscal Federalism in India\n\nIndia follows a **quasi-federal** structure where the Centre and States have distinct taxation and expenditure powers.\n\n### Finance Commission (Article 280)\n\nConstituted every five years to recommend:\n- Division of **central tax revenues** between Centre and States (vertical devolution)\n- Distribution among States (horizontal devolution)\n- Grants-in-aid to States\n\n### 15th Finance Commission (2021–26)\n\n- Chaired by **N.K. Singh**\n- Recommended **41%** of divisible pool to States (same as 14th FC, but excluded J&K after bifurcation)\n- Introduced **performance incentives** for States on GST implementation, ease of doing business, power sector reforms\n\n### Criteria for Horizontal Devolution\n\n| Criterion | Weight |\n|-----------|--------|\n| Income Distance | 45% |\n| Population (2011) | 15% |\n| Area | 15% |\n| Forest Cover | 10% |\n| Demographic Performance | 12.5% |\n| Tax Effort | 2.5% |\n\n### Key Challenges\n\n1. **Vertical Imbalance** — Centre collects most taxes but States have larger expenditure responsibilities.\n2. **Centrally Sponsored Schemes** — Conditions attached reduce fiscal autonomy of States.\n3. **GST Council** — Cooperative federalism but dominated by Centre in practice.\n\n> *UPSC Prelims 2023 asked about FC terms and composition.*`,
          tags: ['Economy', 'Federalism', 'Finance Commission', 'GS3', 'Polity'],
          pdfUrl: 'https://financecommission.gov.in/downloads/report_xvfc/Volume_I.pdf',
          publishedAt: new Date('2025-06-10'),
        },
      ]);
    }

    if (!existingMcqs.length) {
      await db.insert(mcqsTable).values([
        {
          questionText: 'With reference to the Indian Constitution, consider the following statements:\n1. The Preamble can be amended under Article 368.\n2. The Preamble was amended once by the 42nd Constitutional Amendment.\nWhich of the statements given above is/are correct?',
          optionA: '1 only',
          optionB: '2 only',
          optionC: 'Both 1 and 2',
          optionD: 'Neither 1 nor 2',
          correctOption: 'C',
          explanation: 'Both statements are correct. The Supreme Court held in the Kesavananda Bharati case (1973) that the Preamble is part of the Constitution and can be amended under Article 368, though basic structure cannot be altered. The 42nd Amendment (1976) added "Socialist", "Secular", and "Integrity" to the Preamble.',
          year: '2024',
          subject: 'Polity',
          topic: 'Preamble',
        },
        {
          questionText: 'Which of the following rights is available to a foreign national in India?',
          optionA: 'Right to Equality (Article 14)',
          optionB: 'Right against Exploitation (Article 23)',
          optionC: 'Right to Constitutional Remedies (Article 32)',
          optionD: 'Right to vote in elections',
          correctOption: 'B',
          explanation: 'Article 23 (prohibition of traffic in human beings and forced labour) is available to both citizens and non-citizens. Article 14 uses "persons" but has specific citizenship-only aspects in practice. Article 32 is available to all persons. The right to vote is reserved only for citizens.',
          year: '2023',
          subject: 'Polity',
          topic: 'Fundamental Rights',
        },
        {
          questionText: 'The "Battle of Plassey" (1757) was significant because:',
          optionA: 'It marked the first British victory in India',
          optionB: 'It established British political supremacy in Bengal and laid the foundation of British rule in India',
          optionC: 'It ended the Maratha power in India',
          optionD: 'It led to the formation of the East India Company',
          correctOption: 'B',
          explanation: 'The Battle of Plassey (1757) between Robert Clive and Siraj-ud-Daulah (with Mir Jafar\'s treachery) gave the British political control of Bengal. This is widely considered the turning point that established British supremacy in India, though it was not their first victory.',
          year: '2022',
          subject: 'History',
          topic: 'Modern History – British Conquest',
        },
        {
          questionText: 'Consider the following statements about the Reserve Bank of India:\n1. It was established in 1935 under the Reserve Bank of India Act, 1934.\n2. It was nationalised in 1949.\n3. The Governor of RBI is appointed by the President of India.\nWhich of the statements given above are correct?',
          optionA: '1 and 2 only',
          optionB: '2 and 3 only',
          optionC: '1 and 3 only',
          optionD: '1, 2 and 3',
          correctOption: 'A',
          explanation: 'Statements 1 and 2 are correct. The RBI was established on April 1, 1935 and nationalised on January 1, 1949. Statement 3 is incorrect — the Governor of RBI is appointed by the Central Government (Union Cabinet), not the President of India.',
          year: 'Practice',
          subject: 'Economy',
          topic: 'Monetary Policy',
        },
        {
          questionText: 'The "Western Ghats" are ecologically significant because:',
          optionA: 'They are the source of all major rivers of peninsular India',
          optionB: 'They are a UNESCO World Heritage Site and one of the world\'s eight "hottest hotspots" of biological diversity',
          optionC: 'They receive the highest rainfall in India',
          optionD: 'They contain the largest mangrove forests in India',
          correctOption: 'B',
          explanation: 'The Western Ghats are a UNESCO World Heritage Site (2012) and recognised as one of the world\'s eight biodiversity hotspots. While they are the source of many west-flowing rivers, eastern rivers like Krishna, Cauvery, Godavari also originate here. The highest rainfall region is Cherrapunji/Mawsynram (northeast India). Mangroves are found in coastal/delta areas, not Ghats.',
          year: '2025',
          subject: 'Geography',
          topic: 'Biodiversity Hotspots',
        },
      ]);
    }

    res.json({ message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
