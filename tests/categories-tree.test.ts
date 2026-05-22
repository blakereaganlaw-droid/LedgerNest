import { describe, it, expect } from "vitest";
import { buildCategoryTree } from "@/lib/categories/build-tree";

describe("Category tree builder", () => {
  it("builds three-level hierarchy in O(n)", () => {
    const nodes = [
      { id: "g1", name: "INCOME", depth: 0, parentId: null, isSystem: false },
      { id: "c1", name: "Employment", depth: 1, parentId: "g1", isSystem: false },
      { id: "s1", name: "Paycheck", depth: 2, parentId: "c1", isSystem: false },
    ];

    const tree = buildCategoryTree(nodes);
    expect(tree).toHaveLength(1);
    expect(tree[0].categories[0].subcategories[0].name).toBe("Paycheck");
  });
});
