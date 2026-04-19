// 5 blob shapes × 3 morph states each (same command structure for SMIL interpolation)
export const SHAPES_MORPH: string[][] = [
  [
    'M60,10 C85,5 95,30 90,55 C85,80 65,95 40,90 C15,85 5,65 10,40 C15,15 35,15 60,10Z',
    'M64,6 C90,2 98,28 86,58 C80,86 62,100 35,92 C10,82 2,62 8,38 C12,14 36,20 64,6Z',
    'M55,14 C82,8 92,34 94,52 C88,76 64,92 45,88 C18,88 8,66 14,40 C18,12 36,12 55,14Z',
  ],
  [
    'M55,8 C80,8 98,28 95,55 C92,82 70,98 45,92 C20,86 4,68 8,42 C12,16 30,8 55,8Z',
    'M60,4 C86,6 100,24 92,58 C88,84 66,100 40,96 C14,86 2,64 4,40 C8,16 28,4 60,4Z',
    'M50,12 C76,10 96,32 98,52 C94,80 72,96 50,88 C24,88 6,72 10,44 C14,16 32,12 50,12Z',
  ],
  [
    'M65,12 C88,10 96,35 90,58 C84,81 60,96 38,88 C16,80 6,58 12,36 C18,14 42,14 65,12Z',
    'M60,16 C84,6 100,30 92,56 C86,82 64,100 34,92 C10,82 2,60 8,38 C14,18 40,20 60,16Z',
    'M70,8 C92,12 92,40 88,60 C80,82 56,94 42,84 C20,78 10,56 16,32 C20,10 46,10 70,8Z',
  ],
  [
    'M50,8 C76,6 96,26 94,52 C92,78 74,96 48,94 C22,92 4,74 6,48 C8,22 24,10 50,8Z',
    'M56,4 C82,4 98,24 96,54 C92,82 70,98 44,98 C18,88 2,70 2,46 C4,20 28,6 56,4Z',
    'M44,12 C70,8 94,28 92,50 C90,76 76,94 52,90 C26,96 8,78 10,50 C12,24 22,14 44,12Z',
  ],
  [
    'M58,6 C84,4 98,24 96,50 C94,76 76,98 50,96 C24,94 2,76 4,50 C6,24 32,8 58,6Z',
    'M64,2 C90,2 100,22 94,54 C90,80 72,100 46,98 C20,90 2,72 4,48 C6,22 36,6 64,2Z',
    'M52,10 C78,8 94,28 96,46 C96,72 78,96 54,92 C28,96 4,78 6,52 C8,26 28,12 52,10Z',
  ],
]

// Duration (seconds) for each shape's morph cycle
export const MORPH_DURS = [3.8, 4.6, 3.3, 4.2, 3.7]

// CSS wobble animation names assigned by blob DOM position
export const WOBBLE_ANIMS = ['wobble1', 'wobble2', 'wobble3']

// 10-color palette
export const COLORS = [
  '#7C6AF7', '#F7836A', '#4BAE8A', '#F5C842', '#60ADEF',
  '#E879A0', '#8BC34A', '#FF9F40', '#A0522D', '#48CAE4',
]

// Default names for new blobs
export const NAMES = [
  'The Protector', 'The Critic', 'The Caregiver', 'The Exile',
  'The Manager', 'The Firefighter', 'The Curious One', 'The Rebel',
]

// Rendered SVG size in pixels per size tier (NOT including name pill)
export const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = {
  sm: 72,
  md: 100,
  lg: 138,
}
