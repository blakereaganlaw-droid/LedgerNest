export type TaxonomyLeaf = { name: string; isSystem?: boolean };
export type TaxonomyCategory = { name: string; subcategories: TaxonomyLeaf[] };
export type TaxonomyGroup = { name: string; categories: TaxonomyCategory[] };

/** Full audit-table taxonomy for copy-on-setup seeding */
export const CATEGORY_TAXONOMY: TaxonomyGroup[] = [
  {
    name: "INCOME",
    categories: [
      {
        name: "Employment",
        subcategories: [
          { name: "Paycheck" },
          { name: "Bonus" },
          { name: "Overtime" },
          { name: "Commission" },
        ],
      },
      {
        name: "Business",
        subcategories: [
          { name: "Business Income" },
          { name: "Side Hustle" },
        ],
      },
    ],
  },
  {
    name: "TRANSFERS",
    categories: [
      {
        name: "Transfers",
        subcategories: [
          { name: "Transfer" },
          { name: "Credit Card Payment" },
          { name: "Balance Adjustment" },
        ],
      },
    ],
  },
  {
    name: "EXPENSES",
    categories: [
      {
        name: "Housing",
        subcategories: [
          { name: "Principal & Interest" },
          { name: "Property Tax" },
          { name: "PMI" },
          { name: "Base Rent" },
          { name: "Parking" },
        ],
      },
      {
        name: "Utilities & Bills",
        subcategories: [
          { name: "Electricity" },
          { name: "Water & Sewer" },
          { name: "Natural Gas" },
          { name: "Trash" },
          { name: "Internet" },
          { name: "Subscriptions" },
        ],
      },
      {
        name: "Food & Dining",
        subcategories: [
          { name: "Groceries" },
          { name: "Restaurants" },
          { name: "Coffee & Snacks" },
          { name: "Alcohol" },
        ],
      },
      {
        name: "Transportation",
        subcategories: [
          { name: "Gas" },
          { name: "EV Charging" },
          { name: "Auto Payment" },
          { name: "Registration" },
          { name: "Tolls" },
          { name: "Public Transit" },
        ],
      },
      {
        name: "Insurance",
        subcategories: [
          { name: "Homeowners" },
          { name: "Auto Insurance" },
          { name: "Health Insurance" },
          { name: "Life Insurance" },
        ],
      },
      {
        name: "Health & Wellness",
        subcategories: [
          { name: "Primary Care" },
          { name: "Dentist" },
          { name: "Eye Care" },
          { name: "Prescriptions" },
          { name: "Fitness" },
          { name: "Therapy" },
        ],
      },
      {
        name: "Debt Payments",
        subcategories: [
          { name: "Credit Card Debt" },
          { name: "Federal Student Loan" },
          { name: "Auto Loan" },
          { name: "Personal Loan" },
        ],
      },
      {
        name: "Savings & Investing",
        subcategories: [
          { name: "Emergency Fund" },
          { name: "401k / IRA" },
          { name: "Brokerage" },
          { name: "Sinking Funds" },
        ],
      },
      {
        name: "Travel",
        subcategories: [
          { name: "Airfare" },
          { name: "Lodging" },
          { name: "Dining While Traveling" },
          { name: "Tours" },
        ],
      },
      {
        name: "Miscellaneous",
        subcategories: [
          { name: "Other" },
          { name: "Check" },
          { name: "Uncategorized", isSystem: true },
        ],
      },
    ],
  },
];

export const TRANSFER_GROUP_NAME = "TRANSFERS";
export const INCOME_GROUP_NAME = "INCOME";
