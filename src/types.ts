export interface Blob {
  id: string
  name: string
  color: string
  size: 'sm' | 'md' | 'lg'
  face: string
  desc: string
  shape: number
  x: number
  y: number
}

export interface Connection {
  id: string
  from: string
  to: string
  label: string
}

export interface AppState {
  blobs: Blob[]
  connections: Connection[]
}
