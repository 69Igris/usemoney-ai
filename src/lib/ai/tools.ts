export const FIRE_TOOLS = [
  // Parameter setters
  {
    type: 'function',
    function: {
      name: 'setCurrentAge',
      description: "Set the user's current age in years.",
      parameters: {
        type: 'object',
        properties: {
          age: { type: 'number', description: 'Age in years, between 18 and 70' },
        },
        required: ['age'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setTargetRetirementAge',
      description: "Set the user's target retirement age in years.",
      parameters: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
            description: 'Target retirement age, between 30 and 80',
          },
        },
        required: ['age'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setLifeExpectancy',
      description: "Set the user's expected lifespan in years.",
      parameters: {
        type: 'object',
        properties: {
          age: {
            type: 'number',
            description: 'Life expectancy in years, between 50 and 100',
          },
        },
        required: ['age'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setCurrentCorpus',
      description: "Set the user's current investment corpus in INR.",
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'Current corpus in INR (e.g. 500000 for ₹5 lakh)',
          },
        },
        required: ['amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setMonthlySavings',
      description: 'Set monthly savings/investment amount in INR.',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'number',
            description: 'Monthly savings amount in INR',
          },
        },
        required: ['amount'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setAnnualSalaryIncrement',
      description:
        'Set annual salary increment percentage (until retirement).',
      parameters: {
        type: 'object',
        properties: {
          percent: {
            type: 'number',
            description: 'Annual salary increment as percentage, 0-30',
          },
        },
        required: ['percent'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setAnnualSavingsIncrement',
      description: 'Set annual savings increment percentage.',
      parameters: {
        type: 'object',
        properties: {
          percent: {
            type: 'number',
            description: 'Annual savings increment as percentage, 0-30',
          },
        },
        required: ['percent'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'setSafeWithdrawalRate',
      description:
        'Set the safe withdrawal rate (SWR) percentage. Common values: 3-4%.',
      parameters: {
        type: 'object',
        properties: {
          percent: {
            type: 'number',
            description: 'SWR as percentage, 1-10',
          },
        },
        required: ['percent'],
      },
    },
  },

  // Asset allocation
  {
    type: 'function',
    function: {
      name: 'addAssetClass',
      description: 'Add a new asset class to the portfolio.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the asset class, e.g. "Crypto"',
          },
          allocation: {
            type: 'number',
            description: 'Allocation percentage 0-100',
          },
          expectedReturn: {
            type: 'number',
            description: 'Expected annual return percentage',
          },
          icon: {
            type: 'string',
            description: 'Optional emoji icon, default 💼',
          },
        },
        required: ['name', 'allocation', 'expectedReturn'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateAssetAllocation',
      description:
        'Change the allocation percentage of an existing asset class by name.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Asset class name (case-insensitive)',
          },
          allocation: {
            type: 'number',
            description: 'New allocation percentage 0-100',
          },
        },
        required: ['name', 'allocation'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateAssetReturn',
      description:
        'Change the expected return of an existing asset class by name.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Asset class name (case-insensitive)',
          },
          expectedReturn: {
            type: 'number',
            description: 'New expected return percentage',
          },
        },
        required: ['name', 'expectedReturn'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'removeAssetClass',
      description: 'Remove an asset class from the portfolio by name.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Asset class name to remove (case-insensitive)',
          },
        },
        required: ['name'],
      },
    },
  },

  // Expenses
  {
    type: 'function',
    function: {
      name: 'addExpense',
      description: 'Add a new monthly expense category.',
      parameters: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Expense category name' },
          monthlyAmount: {
            type: 'number',
            description: 'Monthly amount in INR',
          },
          inflationRate: {
            type: 'number',
            description: 'Annual inflation rate as percentage',
          },
        },
        required: ['category', 'monthlyAmount', 'inflationRate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateExpense',
      description: 'Update an existing expense by category name.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Expense category (case-insensitive)',
          },
          monthlyAmount: {
            type: 'number',
            description: 'New monthly amount in INR (optional)',
          },
          inflationRate: {
            type: 'number',
            description: 'New inflation rate percentage (optional)',
          },
        },
        required: ['category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'removeExpense',
      description: 'Remove an expense category by name.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Expense category to remove (case-insensitive)',
          },
        },
        required: ['category'],
      },
    },
  },

  // Scenarios
  {
    type: 'function',
    function: {
      name: 'saveScenario',
      description: 'Save the current FIRE plan as a named scenario.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Scenario name' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'loadScenario',
      description: 'Load a previously saved scenario by name.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Scenario name (case-insensitive)',
          },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compareScenarios',
      description:
        'Show a comparison overlay of multiple saved scenarios on the chart.',
      parameters: {
        type: 'object',
        properties: {
          names: {
            type: 'array',
            items: { type: 'string' },
            description: 'Scenario names to compare',
          },
        },
        required: ['names'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'resetAll',
      description:
        'Reset all FIRE parameters, assets, and expenses to defaults. Saved scenarios are preserved.',
      parameters: { type: 'object', properties: {} },
    },
  },
] as const;
