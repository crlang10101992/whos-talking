import { SHAPES_MORPH, MORPH_DURS, SIZE_PX } from '../constants'
import { FACES } from '../faces'
import type { Blob } from '../types'

interface Props {
  blob: Blob
  wobbleClass: string
}

export default function BlobSvg({ blob, wobbleClass }: Props) {
  const paths = SHAPES_MORPH[blob.shape]
  const dur = `${MORPH_DURS[blob.shape]}s`
  const size = SIZE_PX[blob.size]
  const face = FACES.find(f => f.id === blob.face) ?? FACES[0]

  return (
    <svg
      className={`blob-svg ${wobbleClass}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transformOrigin: 'center center' }}
    >
      <path d={paths[0]} fill={blob.color} opacity="0.92">
        <animate
          attributeName="d"
          dur={dur}
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.33;0.66;1"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1"
          values={`${paths[0]};${paths[1]};${paths[2]};${paths[0]}`}
        />
      </path>
      {face.draw()}
    </svg>
  )
}
