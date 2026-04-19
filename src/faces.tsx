import React from 'react'

export interface Face {
  id: string
  label: string
  draw: () => React.ReactElement
}

export const FACES: Face[] = [
  {
    id: 'happy',
    label: 'Happy',
    draw: () => (
      <>
        <path d="M31,46 Q37,41 43,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M57,46 Q63,41 69,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M34,59 Q50,70 66,59" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'simple',
    label: 'Simple',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M38,60 Q50,68 62,60" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'sad',
    label: 'Sad',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M38,64 Q50,56 62,64" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'surprised',
    label: 'Surprised',
    draw: () => (
      <>
        <circle cx="37" cy="45" r="6" fill="#1a1a2e"/>
        <circle cx="63" cy="45" r="6" fill="#1a1a2e"/>
        <ellipse cx="50" cy="63" rx="6" ry="7" fill="#1a1a2e"/>
      </>
    ),
  },
  {
    id: 'laughing',
    label: 'Laughing',
    draw: () => (
      <>
        <path d="M31,46 Q37,41 43,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M57,46 Q63,41 69,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M32,58 Q50,74 68,58" stroke="#1a1a2e" strokeWidth="2" fill="#1a1a2e"/>
        <path d="M34,58 Q50,70 66,58" fill="white"/>
      </>
    ),
  },
  {
    id: 'love',
    label: 'In Love',
    draw: () => (
      <>
        <path d="M29,42 C29,38 33,37 37,41 C41,37 45,38 45,42 C45,47 37,53 37,53 C37,53 29,47 29,42Z" fill="#E879A0"/>
        <path d="M55,42 C55,38 59,37 63,41 C67,37 71,38 71,42 C71,47 63,53 63,53 C63,53 55,47 55,42Z" fill="#E879A0"/>
        <path d="M38,63 Q50,71 62,63" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'wink',
    label: 'Wink',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M57,46 Q63,41 69,46" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M38,60 Q50,68 62,60" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'angry',
    label: 'Fierce',
    draw: () => (
      <>
        <path d="M28,38 L42,43" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round"/>
        <path d="M72,38 L58,43" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="37" cy="48" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="48" r="4" fill="#1a1a2e"/>
        <path d="M38,63 Q50,56 62,63" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
  {
    id: 'nervous',
    label: 'Nervous',
    draw: () => (
      <>
        <circle cx="37" cy="46" r="4" fill="#1a1a2e"/>
        <circle cx="63" cy="46" r="4" fill="#1a1a2e"/>
        <path d="M36,62 Q41,57 46,62 Q50,67 54,62 Q59,57 64,62" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
    ),
  },
]
