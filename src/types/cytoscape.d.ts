declare module 'react-cytoscapejs' {
  import { Component } from 'react'
  import cytoscape from 'cytoscape'

  interface CytoscapeComponentProps {
    elements: any[]
    style?: React.CSSProperties
    stylesheet?: any[]
    layout?: any
    cy?: (cy: cytoscape.Core) => void
    wheelSensitivity?: number
    minZoom?: number
    maxZoom?: number
    className?: string
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
}

declare module 'cytoscape-dagre' {
  import cytoscape from 'cytoscape'
  const dagreExtension: cytoscape.Ext
  export = dagreExtension
}

declare module 'cytoscape-cola' {
  import cytoscape from 'cytoscape'
  const colaExtension: cytoscape.Ext
  export = colaExtension
} 