

import { Source, Message, StudioTool, Note, NotebookItem } from './types';

export const MOCK_SOURCES: Source[] = [
  { 
    id: '1', 
    title: 'CPSC 304 - Lecture 1 Intro.pdf', 
    type: 'PDF', 
    date: 'Oct 12', 
    selected: true,
    content: "# Introduction to Database Systems\n\n## What is a Database System?\nA database system is basically a computerized record-keeping system.\n\n### Components\n- Database: collection of persistent data\n- DBMS: software that enables users to create and maintain a database\n\n## Data Independence\n- Physical Data Independence: Ability to modify physical schema without changing logical schema.\n- Logical Data Independence: Ability to modify logical schema without changing external views."
  },
  { 
    id: '2', 
    title: 'Database_Systems_Complete.txt', 
    type: 'TXT', 
    date: 'Oct 12', 
    selected: true,
    content: "CHAPTER 4: NORMALIZATION\n\nNormalization is the process of organizing data in a database. This includes creating tables and establishing relationships between those tables according to rules designed both to protect the data and to make the database more flexible by eliminating redundancy and inconsistent dependency.\n\n1NF: Atomic values.\n2NF: No partial dependencies.\n3NF: No transitive dependencies.\nBCNF: Every determinant is a candidate key."
  },
  { 
    id: '3', 
    title: 'SQL-99 Standards Reference', 
    type: 'WEB', 
    date: 'Oct 10', 
    selected: false,
    content: "## SQL-99 Features\n\n1. Boolean data type\n2. Distinct types\n3. Triggers\n4. Recursive queries (WITH RECURSIVE)\n\n### Triggers\nCREATE TRIGGER name\nBEFORE | AFTER | INSTEAD OF\nINSERT | UPDATE | DELETE\nON table..."
  },
  { 
    id: '4', 
    title: 'Midterm Review Notes v2.pdf', 
    type: 'PDF', 
    date: 'Oct 08', 
    selected: false,
    content: "## Midterm Topics\n\n- ER Diagrams (Weak entities, ISA hierarchies)\n- Relational Algebra (Select, Project, Join, Division)\n- SQL Queries (Group By, Having, Nested Subqueries)\n- Normalization (1NF, 2NF, 3NF, BCNF)\n\n**Study Tip:** Practice decomposing relations into BCNF."
  },
  { 
    id: '5', 
    title: 'Normalization Forms (1NF-3NF)', 
    type: 'TXT', 
    date: 'Sep 25', 
    selected: false,
    content: "## Summary of Normal Forms\n\nFirst Normal Form (1NF):\n- Eliminate Repeating Groups\n- Create a separate table for each set of related data\n\nSecond Normal Form (2NF):\n- Eliminate Redundant Data\n- If an attribute depends on only part of a multi-valued key, remove it to a separate table."
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Explain the difference between 3NF and BCNF based on these notes.',
    timestamp: new Date(Date.now() - 100000),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Based on the *Database Systems Complete* text, the primary difference lies in how they handle functional dependencies:\n\n1. **Third Normal Form (3NF)** allows a functional dependency X → A if X is a superkey OR if A is a prime attribute (part of a candidate key). \n2. **Boyce-Codd Normal Form (BCNF)** is stricter. It requires that for every functional dependency X → A, X must be a superkey. \n\nEssentially, BCNF removes the "prime attribute" loophole found in 3NF.',
    citations: [2],
    timestamp: new Date(Date.now() - 80000),
  },
];

export const STUDIO_TOOLS: StudioTool[] = [
  { id: 'audio', label: 'Audio Overview', iconName: 'AudioLines', color: 'text-indigo-600' },
  { id: 'video', label: 'Video Overview', iconName: 'Clapperboard', color: 'text-emerald-600' },
  { id: 'mindmap', label: 'Mind Map', iconName: 'GitFork', color: 'text-fuchsia-600' },
  { id: 'reports', label: 'Reports', iconName: 'FileText', color: 'text-amber-600' },
  { id: 'flashcards', label: 'Flashcards', iconName: 'Layers', color: 'text-orange-600' },
  { id: 'quiz', label: 'Quiz', iconName: 'HelpCircle', color: 'text-sky-600' },
  { id: 'infographic', label: 'Infographic', iconName: 'BarChart3', color: 'text-pink-600' },
  { id: 'slides', label: 'Slide Deck', iconName: 'Presentation', color: 'text-yellow-600' },
];

export const SAVED_NOTES: Note[] = [
  { 
    id: '1', 
    title: 'SQL Deep Dive', 
    preview: 'Audio Overview • 12 min', 
    type: 'audio' 
  },
  { 
    id: '2', 
    title: 'Normalization Quiz', 
    preview: '3 Questions • Hard', 
    type: 'quiz',
    questions: [
      {
        question: "Which Normal Form strictly forbids transitive dependencies?",
        options: ["1NF", "2NF", "3NF", "All of the above"],
        answer: 2,
        hint: "Think about dependencies that don't involve the primary key directly."
      },
      {
        question: "A relation is in BCNF if...",
        options: ["All attributes are atomic", "Every determinant is a candidate key", "It has no partial dependencies", "It is in 4NF"],
        answer: 1,
        hint: "BCNF is a stronger version of 3NF concerning determinants."
      },
      {
        question: "What is a 'partial dependency'?",
        options: ["Dependency on a non-prime attribute", "Dependency on part of a composite primary key", "Dependency on a foreign key", "None of the above"],
        answer: 1,
        hint: "It only happens when the primary key is made up of multiple columns."
      }
    ]
  },
  {
    id: '3',
    title: 'Relational Algebra Key Terms',
    preview: '5 Cards',
    type: 'flashcard',
    flashcards: [
        { front: "Selection (σ)", back: "Unary operation that selects tuples that satisfy a given predicate." },
        { front: "Projection (π)", back: "Unary operation that returns its argument relation, with certain attributes left out." },
        { front: "Cartesian Product (×)", back: "Combines information of two different relations into one." },
        { front: "Natural Join (⋈)", back: "Join operation that creates an implicit join clause for equal attributes." },
        { front: "Set Difference (-)", back: "Returns tuples that are in one relation but not in another." }
    ]
  },
  {
    id: '4',
    title: 'Course Summary: Database Systems',
    preview: 'Report • Markdown',
    type: 'report',
    content: "# Database Management Systems\n\n## 1. Introduction\nA database management system (DBMS) is system software for creating and managing databases. The DBMS provides users and programmers with a systematic way to create, retrieve, update and manage data.\n\n## 2. The Relational Model\nProposed by E.F. Codd in 1970, the relational model is based on predicate logic and set theory.\n\n### Key Concepts\n*   **Relation**: A table with columns and rows.\n*   **Attribute**: A named column of a relation.\n*   **Tuple**: A row of a relation.\n*   **Domain**: A set of allowable values for one or more attributes.\n\n## 3. SQL\nSQL (Structured Query Language) is the standard language for relational database management systems.\n\n> \"Data is the new oil.\" — Clive Humby\n\n## 4. Conclusion\nUnderstanding the theoretical underpinnings of databases ensures robust application design and efficient data retrieval."
  }
];

export const MOCK_NOTEBOOKS: NotebookItem[] = [
  {
    id: 'featured-1',
    title: 'How To Build A Life, from The Atlantic',
    date: 'Apr 22, 2025',
    sourceCount: 46,
    author: 'The Atlantic',
    coverColor: 'bg-orange-600',
    isFeatured: true
  },
  {
    id: 'featured-2',
    title: 'Secrets of the Super Agers',
    date: 'May 5, 2025',
    sourceCount: 17,
    author: 'Eric Topol',
    coverColor: 'bg-emerald-700',
    isFeatured: true
  },
  {
    id: 'featured-3',
    title: 'The Science Fan\'s Guide To Visiting...',
    date: 'May 12, 2025',
    sourceCount: 17,
    author: 'Travel',
    coverColor: 'bg-blue-700',
    isFeatured: true
  },
  {
    id: 'featured-4',
    title: 'Parenting Advice for the Digital Age',
    date: 'May 5, 2025',
    sourceCount: 21,
    author: 'Techno Sapiens',
    coverColor: 'bg-amber-600',
    isFeatured: true
  },
  {
    id: 'nb-1',
    title: 'CPSC 304',
    date: 'Sep 16, 2025',
    sourceCount: 39,
    coverColor: 'bg-yellow-500', // Folder-like
    icon: 'Folder'
  },
  {
    id: 'nb-2',
    title: 'The Holy Quran: Chapters and...',
    date: 'Sep 24, 2025',
    sourceCount: 1,
    coverColor: 'bg-sky-500',
    icon: 'Book'
  },
  {
    id: 'nb-3',
    title: 'STAT 404',
    date: 'Oct 6, 2025',
    sourceCount: 34,
    coverColor: 'bg-purple-400',
    icon: 'BarChart'
  },
  {
    id: 'nb-4',
    title: 'Google Data Analytics',
    date: 'Oct 21, 2025',
    sourceCount: 23,
    coverColor: 'bg-indigo-600',
    icon: 'Search'
  },
  {
    id: 'nb-5',
    title: 'CPSC 322',
    date: 'Sep 16, 2025',
    sourceCount: 33,
    coverColor: 'bg-slate-600',
    icon: 'Monitor'
  },
  {
    id: 'nb-6',
    title: 'Principles of Learning, Retrieval, Spacing...',
    date: 'Oct 15, 2025',
    sourceCount: 9,
    coverColor: 'bg-rose-500',
    icon: 'Brain'
  },
];