---
name: UPSC prelims source
description: Data-shaping decision for the uploaded UPSC prelims collection.
---

The uploaded collection contains 3,897 questions from 1995–2025. Older years contain two 150-question papers, while later years contain the 100-question format. The app presents exactly questions 1–100 for every year so the year selector always opens one consistent 100-question paper.

**Why:** The product request is explicitly year-wise 100-question prelims papers, and mixing the second older paper into the same year would make the selected-year experience ambiguous.

**How to apply:** Keep the year JSON files keyed by year with question numbers 1–100 and enforce the question year at load time. Preserve source-marked unavailable or ambiguous answers as non-answerable instead of inventing an answer; exclude those entries from scored tests.