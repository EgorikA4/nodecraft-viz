export type NodeType = 'Organization' | 'OrgUnit' | 'Position' | 'Person' | 'Account';

export type RelationType =
  | 'HAS_UNIT' | 'PARENT_OF' | 'HAS_POSITION' | 'OCCUPIED_BY'
  | 'HAS_ACCOUNT' | 'REPORTS_TO' | 'MEMBER_OF' | 'OWNS' | 'MANAGES' | 'CUSTOM';

export interface OrganizationData {
  name?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  address?: string;
}

export interface OrgUnitData {
  name?: string;
  code?: string;
  type?: string;
}

export interface PositionData {
  name?: string;
  grade?: string;
}

export interface PersonData {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  birthday?: string;
  gender?: string;
  citizenship?: string;
  inn?: string;
  snils?: string;
}

export interface AccountData {
  provider?: string;
  identifier?: string;
}

export type NodeData = OrganizationData | OrgUnitData | PositionData | PersonData | AccountData;

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  parentId?: string;
  externalId?: string;
  data: NodeData;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationType: RelationType;
}

export interface GraphDocument {
  id: string;
  title: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const NODE_TYPE_CONFIG: Record<NodeType, { color: string; bgClass: string; borderClass: string; icon: string }> = {
  Organization: { color: 'hsl(220, 70%, 55%)', bgClass: 'bg-blue-50', borderClass: 'border-blue-300', icon: 'Building2' },
  OrgUnit: { color: 'hsl(170, 55%, 45%)', bgClass: 'bg-teal-50', borderClass: 'border-teal-300', icon: 'Network' },
  Position: { color: 'hsl(270, 55%, 55%)', bgClass: 'bg-purple-50', borderClass: 'border-purple-300', icon: 'Briefcase' },
  Person: { color: 'hsl(35, 80%, 55%)', bgClass: 'bg-amber-50', borderClass: 'border-amber-300', icon: 'User' },
  Account: { color: 'hsl(215, 15%, 55%)', bgClass: 'bg-slate-50', borderClass: 'border-slate-300', icon: 'Key' },
};

export const RELATION_TYPES: RelationType[] = [
  'HAS_UNIT', 'PARENT_OF', 'HAS_POSITION', 'OCCUPIED_BY',
  'HAS_ACCOUNT', 'REPORTS_TO', 'MEMBER_OF', 'OWNS', 'MANAGES', 'CUSTOM',
];

export const NODE_TYPES: NodeType[] = ['Organization', 'OrgUnit', 'Position', 'Person', 'Account'];
