export const colors = {
  background: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    tertiary: 'bg-gray-100',
  },

  sidebar: {
    background: 'bg-gray-900',
    border: 'border-gray-800',
    itemActive: 'bg-gray-800',
    itemHover: 'hover:bg-gray-800',
    text: 'text-gray-100',
  },

  navbar: {
    background: 'bg-white',
    border: 'border-b border-gray-200',
    text: 'text-gray-900',
  },

  card: {
    background: 'bg-white',
    border: 'border border-gray-200',
    hover: 'hover:border-gray-300',
  },

  cardInner: {
    background: 'bg-gray-50',
    border: 'border border-gray-200',
    hover: 'hover:border-gray-300',
  },

  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    muted: 'text-gray-400',
  },

  skeleton: {
    background: 'bg-gray-200',
  },

  empty: {
    icon: 'text-gray-300',
    text: 'text-gray-500',
  },

  primary: {
    DEFAULT: 'text-indigo-600',
    background: 'bg-indigo-50',
    backgroundHover: 'hover:bg-indigo-100',
    border: 'border-indigo-200',
    borderHover: 'hover:border-indigo-300',
    solid: 'bg-indigo-600',
    text: 'text-white',
  },

  success: {
    DEFAULT: 'text-emerald-600',
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
    solid: 'bg-emerald-600',
    icon: 'bg-emerald-500',
  },

  warning: {
    DEFAULT: 'text-amber-700',
    background: 'bg-amber-50',
    border: 'border-amber-200',
    solid: 'bg-amber-600',
    icon: 'bg-amber-500',
  },

  danger: {
    DEFAULT: 'text-rose-700',
    background: 'bg-rose-50',
    border: 'border-rose-200',
    solid: 'bg-rose-600',
    icon: 'bg-rose-500',
  },

  info: {
    DEFAULT: 'text-sky-700',
    background: 'bg-sky-50',
    border: 'border-sky-200',
    solid: 'bg-sky-600',
    icon: 'bg-sky-500',
  },

  accent: {
    purple: {
      DEFAULT: 'text-purple-600',
      solid: 'bg-purple-500',
      icon: 'bg-purple-500',
    },
    orange: {
      DEFAULT: 'text-orange-600',
      solid: 'bg-orange-500',
      icon: 'bg-orange-500',
    },
    teal: {
      DEFAULT: 'text-teal-600',
      solid: 'bg-teal-500',
      icon: 'bg-teal-500',
    },
  },

  timeline: {
    connector: 'bg-gray-200',
  },
} as const

export const spacing = {
  card: 'p-4',
  cardCompact: 'p-3',
  cardGap: 'gap-3',
  section: 'space-y-3',
  cardInner: 'p-3',
  iconGap: 'gap-2',
  iconGapSmall: 'gap-1.5',
} as const

export const typography = {
  pageTitle: 'text-2xl font-semibold',
  cardTitle: 'text-sm font-semibold',
  cardDescription: 'text-xs',
  body: 'text-sm',
  caption: 'text-xs',
  statValue: 'text-2xl font-bold',
} as const

export const sizing = {
  icon: {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
    xlarge: 'h-8 w-8',
  },
  iconContainer: {
    small: 'h-7 w-7',
    medium: 'h-10 w-10',
  },
} as const

export const effects = {
  transition: 'transition-colors',
  transitionAll: 'transition-all',
  rounded: 'rounded-lg',
  roundedMd: 'rounded-md',
  shadow: 'hover:shadow-md',
} as const
