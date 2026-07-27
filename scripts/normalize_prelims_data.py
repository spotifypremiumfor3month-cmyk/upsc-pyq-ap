from __future__ import annotations

import json
from pathlib import Path


DATA_DIR = Path("artifacts/upsc-pyq/public/data/prelims")

MISSING_QUESTIONS = {
    1998: {
        78: {
            "question": "Match List I with List II and select the correct answer using the codes given below the lists:\n\nList I (Minerals)\nI. Graphite\nII. Lead\nIII. Salt\nIV. Silver\n\nList II (Mining area)\nA. Bellary\nB. Didwana\nC. Rampa\nD. Zawar",
            "options": {
                "a": "I-C, II-D, III-A, IV-B",
                "b": "I-A, II-D, III-B, IV-C",
                "c": "I-C, II-A, III-D, IV-B",
                "d": "I-B, II-C, III-A, IV-D",
            },
            "answerNote": "The uploaded source says no listed option matches the factual pairings.",
            "subject": "Geography › Economic & Mineral Geography",
            "difficulty": "moderate",
        }
    },
    2003: {
        53: {
            "question": "With reference to Indian defence, which one of the following statements is correct?",
            "options": {
                "a": "With the induction of Prithvi II, the IAF is the only air force in the world with surface-to-surface ballistic missiles under its command",
                "b": "Sukhoi-30 MKI jet fighters can launch air-to-air and air-to-surface precision missiles",
                "c": "Trishul is a supersonic surface-to-air missile with a range of 30 km",
                "d": "The indigenously built INS Prabal can launch surface-to-surface missiles",
            },
            "answerNote": "The uploaded source marks this answer as ambiguous: both (b) and (d) are correct.",
            "subject": "Science & Technology › Defence Technology",
            "difficulty": "moderate",
        }
    },
    2005: {
        45: {
            "question": "Consider the following statements:\n\n1. The Charter of the United Nations Organization was adopted at Geneva, Switzerland in June 1945.\n2. India was admitted to the United Nations Organization in the year 1945.\n3. The Trusteeship Council of the United Nations Organization was established to look after the affairs of territories detached from Japan and Italy after the Second World War or such territories not under the control of a country at that time.\n\nWhich of the statements given above is/are correct?",
            "options": {
                "a": "1, 2 and 3",
                "b": "2 only",
                "c": "1 and 3",
                "d": "3 only",
            },
            "answerNote": "The uploaded source marks the answer as inconsistent and notes that it should read “2 and 3”.",
            "subject": "Current Affairs › International Organisations & Groupings",
            "difficulty": "moderate",
        }
    },
    2020: {
        27: {
            "question": "Gandhi-Irwin Pact included which of the following?\n\n1. Invitation to Congress to participate in the Round Table Conference\n2. Withdrawal of Ordinances promulgated in connection with the Civil Disobedience Movement\n3. Acceptance of Gandhiji’s suggestion for enquiry into police excesses\n4. Release of only those prisoners who were not charged with violence\n\nSelect the correct answer using the code given below:",
            "options": {
                "a": "1 only",
                "b": "1, 2 and 4 only",
                "c": "3 only",
                "d": "2, 3 and 4 only",
            },
            "answerNote": "The uploaded source marks the answer as unavailable (x).",
            "subject": "Modern History › Gandhian Mass Movements (1915-1942)",
            "difficulty": "moderate",
        },
        52: {
            "question": "With reference to the international trade of India at present, which of the following statements is/are correct?\n\n1. India’s merchandise exports are less than its merchandise imports.\n2. India’s imports of iron and steel, chemicals, fertilisers and machinery have decreased in recent years.\n3. India’s exports of services are more than its imports of services.\n4. India suffers from an overall trade/current account deficit.\n\nSelect the correct answer using the code given below:",
            "options": {
                "a": "1 and 2 only",
                "b": "2 and 4 only",
                "c": "3 only",
                "d": "1, 3 and 4 only",
            },
            "answerNote": "The uploaded source marks the answer as unavailable (x).",
            "subject": "Indian Economy › External Sector & Balance Of Payments",
            "difficulty": "moderate",
        }
    },
    2021: {
        80: {
            "question": "Consider the following statements:\n\n1. In India, there is no law restricting the candidates from contesting in one Lok Sabha election from three constituencies.\n2. In 1991 Lok Sabha Election, Shri Devi Lal contested from three Lok Sabha constituencies.\n3. As per the existing rules, if a candidate contests in one Lok Sabha election from many constituencies, his/her party should bear the cost of bye-elections to the constituencies vacated by him/her in the event of him/her winning in all the constituencies.\n\nWhich of the statements given above is/are correct?",
            "options": {
                "a": "1 only",
                "b": "2 only",
                "c": "1 and 3",
                "d": "2 and 3",
            },
            "answerNote": "The uploaded source marks the answer as unavailable (x).",
            "subject": "Indian Polity › Elections & Electoral Reforms",
            "difficulty": "moderate",
        }
    },
    2022: {
        61: {
            "question": "Consider the following statements:\n\n1. Tight monetary policy of US Federal Reserve could lead to capital flight.\n2. Capital flight may increase the interest cost of firms with existing External Commercial Borrowings (ECBs).\n3. Devaluation of domestic currency decreases the currency risk associated with ECBs.\n\nWhich of the statements given above is/are correct?",
            "options": {
                "a": "1 and 2 only",
                "b": "2 and 3 only",
                "c": "1 and 3 only",
                "d": "1, 2 and 3",
            },
            "answerNote": "The uploaded source marks the answer as unavailable (x).",
            "subject": "Indian Economy › External Sector & Balance Of Payments",
            "difficulty": "moderate",
        }
    },
}


def main() -> None:
    index = []
    for year in range(1995, 2026):
        path = DATA_DIR / f"{year}.json"
        questions = json.loads(path.read_text(encoding="utf-8"))
        normalized = {
            int(question["questionNumber"]): question
            for question in questions
            if int(question.get("year", year)) == year
            and 1 <= int(question.get("questionNumber", 0)) <= 100
        }

        for question_number, missing in MISSING_QUESTIONS.get(year, {}).items():
            normalized[question_number] = {
                "id": f"prelims_{year}_{question_number}",
                "year": year,
                "questionNumber": question_number,
                "question": missing["question"],
                "options": missing["options"],
                "answer": "x",
                "answerNote": missing["answerNote"],
                "subject": missing["subject"],
                "difficulty": missing["difficulty"],
                "explanation": "",
            }

        result = [normalized[number] for number in sorted(normalized)]
        if len(result) != 100:
            raise ValueError(f"{year} has {len(result)} questions after normalization")
        if {question["year"] for question in result} != {year}:
            raise ValueError(f"{year} contains a question from another year")

        path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        index.append({"year": year, "count": len(result), "slug": f"prelims_{year}"})

    (DATA_DIR / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Normalized {len(index)} years to exactly 100 questions each.")


if __name__ == "__main__":
    main()