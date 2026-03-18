export interface PropDef {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export interface ComponentDef {
  name: string;
  description: string;
  file: string;
  demo: () => JSX.Element;
  props?: PropDef[];
}

export interface ComponentGroup {
  name: string;
  items: ComponentDef[];
}
