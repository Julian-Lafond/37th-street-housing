import type { Faq } from "./types";

// Unpublished entries are placeholders waiting on the owner (see PLACEHOLDERS.md).
// Fill in the answer and set published: true to show one.

export const faqs: Faq[] = [
  {
    id: "pricing",
    question: "Is the rent per bedroom or per apartment?",
    answer:
      "Per apartment. The monthly rent shown covers the whole apartment for one calendar month. The “per bedroom if split evenly” figure is only an illustration of an even split, not the price of a room.",
    order: 1,
    published: true,
  },
  {
    id: "lease-term",
    question: "How long is the lease?",
    answer: "All apartments lease on a 12-month term.",
    order: 2,
    published: true,
  },
  {
    id: "availability",
    question: "When are the apartments available?",
    answer: "All five apartments are available for move-in in August 2027.",
    order: 3,
    published: true,
  },
  {
    id: "furnished",
    question: "Are the apartments furnished?",
    answer:
      "Yes. Every apartment is leased fully furnished, including a bed, desk and chair in each bedroom and furnished shared spaces.",
    order: 4,
    published: true,
  },
  {
    id: "laundry",
    question: "Is there laundry?",
    answer: "Yes. Every apartment has its own washer and dryer inside the unit.",
    order: 5,
    published: true,
  },
  {
    id: "bathrooms",
    question: "Does every bedroom have its own bathroom?",
    answer: "Yes. Each bedroom in every apartment has its own private bathroom.",
    order: 6,
    published: true,
  },
  { id: "utilities", question: "Are utilities included?", answer: "", order: 7, published: false },
  { id: "parking", question: "Is parking available?", answer: "", order: 8, published: false },
  { id: "pets", question: "Are pets allowed?", answer: "", order: 9, published: false },
  { id: "tours", question: "Can I tour an apartment?", answer: "", order: 10, published: false },
  { id: "application", question: "How do I apply, and is there an application fee?", answer: "", order: 11, published: false },
];
