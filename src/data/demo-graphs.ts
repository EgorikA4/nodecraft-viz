import { GraphDocument } from '@/types/graph';

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const lastWeek = new Date(Date.now() - 604800000).toISOString();

export const demoGraphs: GraphDocument[] = [
  {
    id: 'graph-acme',
    title: 'Acme Corp Structure',
    version: 3,
    createdAt: lastWeek,
    updatedAt: now,
    nodes: [
      { id: 'n1', type: 'Organization', label: 'Acme Corp', description: 'Parent holding company', data: { name: 'Acme Corporation', inn: '7701234567', kpp: '770101001', ogrn: '1037700123456', address: '123 Business Ave, Moscow' }, position: { x: 400, y: 50 } },
      { id: 'n2', type: 'OrgUnit', label: 'Engineering', description: 'Software engineering department', parentId: 'n1', data: { name: 'Engineering Department', code: 'ENG-01', type: 'Department' }, position: { x: 200, y: 200 } },
      { id: 'n3', type: 'OrgUnit', label: 'Human Resources', description: 'HR department', parentId: 'n1', data: { name: 'HR Department', code: 'HR-01', type: 'Department' }, position: { x: 600, y: 200 } },
      { id: 'n4', type: 'Position', label: 'CTO', description: 'Chief Technology Officer', parentId: 'n2', data: { name: 'Chief Technology Officer', grade: 'C-Level' }, position: { x: 100, y: 370 } },
      { id: 'n5', type: 'Position', label: 'Senior Engineer', description: 'Senior Software Engineer', parentId: 'n2', data: { name: 'Senior Software Engineer', grade: 'Senior' }, position: { x: 300, y: 370 } },
      { id: 'n6', type: 'Position', label: 'HR Manager', description: 'Human Resources Manager', parentId: 'n3', data: { name: 'HR Manager', grade: 'Manager' }, position: { x: 600, y: 370 } },
      { id: 'n7', type: 'Person', label: 'John Doe', description: 'CTO of Acme Corp', data: { first_name: 'John', last_name: 'Doe', middle_name: '', birthday: '1985-03-15', gender: 'Male', citizenship: 'US', inn: '123456789012', snils: '123-456-789 00' }, position: { x: 100, y: 530 } },
      { id: 'n8', type: 'Person', label: 'Jane Smith', description: 'Senior Engineer at Acme', data: { first_name: 'Jane', last_name: 'Smith', middle_name: 'A.', birthday: '1990-07-22', gender: 'Female', citizenship: 'US', inn: '987654321098', snils: '987-654-321 00' }, position: { x: 300, y: 530 } },
      { id: 'n9', type: 'Account', label: 'john.doe@ldap', description: 'LDAP account for John Doe', data: { provider: 'LDAP', identifier: 'john.doe@acme.local' }, position: { x: 100, y: 680 } },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', relationType: 'HAS_UNIT' },
      { id: 'e2', source: 'n1', target: 'n3', relationType: 'HAS_UNIT' },
      { id: 'e3', source: 'n2', target: 'n4', relationType: 'HAS_POSITION' },
      { id: 'e4', source: 'n2', target: 'n5', relationType: 'HAS_POSITION' },
      { id: 'e5', source: 'n3', target: 'n6', relationType: 'HAS_POSITION' },
      { id: 'e6', source: 'n4', target: 'n7', relationType: 'OCCUPIED_BY' },
      { id: 'e7', source: 'n5', target: 'n8', relationType: 'OCCUPIED_BY' },
      { id: 'e8', source: 'n7', target: 'n9', relationType: 'HAS_ACCOUNT' },
      { id: 'e9', source: 'n4', target: 'n5', relationType: 'MANAGES' },
    ],
  },
  {
    id: 'graph-beta',
    title: 'Beta Holdings Group',
    version: 1,
    createdAt: lastWeek,
    updatedAt: yesterday,
    nodes: [
      { id: 'b1', type: 'Organization', label: 'Beta Holdings', data: { name: 'Beta Holdings LLC' }, position: { x: 300, y: 100 } },
      { id: 'b2', type: 'OrgUnit', label: 'Finance', data: { name: 'Finance', code: 'FIN-01', type: 'Department' }, position: { x: 300, y: 250 } },
    ],
    edges: [
      { id: 'be1', source: 'b1', target: 'b2', relationType: 'HAS_UNIT' },
    ],
  },
  {
    id: 'graph-startup',
    title: 'Startup Inc Org',
    version: 2,
    createdAt: lastWeek,
    updatedAt: lastWeek,
    nodes: [
      { id: 's1', type: 'Organization', label: 'Startup Inc', data: { name: 'Startup Inc' }, position: { x: 300, y: 100 } },
    ],
    edges: [],
  },
];
