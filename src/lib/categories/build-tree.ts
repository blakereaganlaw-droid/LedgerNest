export type CategoryLeafDTO = { id: string; name: string; isSystem: boolean };
export type CategoryItemDTO = {
  id: string;
  name: string;
  subcategories: CategoryLeafDTO[];
};
export type CategoryTreeGroupDTO = {
  id: string;
  name: string;
  slug: string | null;
  categories: CategoryItemDTO[];
};

type NodeRow = {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
  isSystem: boolean;
  slug?: string | null;
};

export function buildCategoryTree(
  nodes: NodeRow[],
): CategoryTreeGroupDTO[] {
  const nodeMap = new Map<
    string,
    NodeRow & { children: NodeRow[] }
  >();

  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  const groups: (NodeRow & { slug?: string | null; children: NodeRow[] })[] =
    [];

  for (const node of nodes) {
    const current = nodeMap.get(node.id);
    if (!current) continue;
    if (node.depth === 0) {
      groups.push(current);
    } else if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) parent.children.push(current);
    }
  }

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug ?? null,
    categories: g.children.map((c) => {
      const cat = nodeMap.get(c.id);
      const subs = cat?.children ?? [];
      return {
        id: c.id,
        name: c.name,
        subcategories: subs.map((s) => ({
          id: s.id,
          name: s.name,
          isSystem: s.isSystem,
        })),
      };
    }),
  }));
}
