export interface Component {
  id: string
  type: string
  props: Record<string, any>
  children?: Component[]
}

export interface Project {
  id: string
  name: string
  description?: string
  components: Component[]
  createdAt: Date
  updatedAt: Date
}
