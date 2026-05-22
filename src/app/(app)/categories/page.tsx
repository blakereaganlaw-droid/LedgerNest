import { getCategoryTree } from "@/lib/dal/categories";

export default async function CategoriesPage() {
  const tree = await getCategoryTree();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="text-sm text-muted-foreground">
        Three-level hierarchy. Only leaf subcategories are selectable for transactions.
      </p>
      <div className="space-y-6">
        {tree.map((group) => (
          <div key={group.id} className="rounded-xl border border-border p-4">
            <h2 className="font-semibold text-primary">{group.name}</h2>
            <div className="mt-3 space-y-4 pl-4">
              {group.categories.map((cat) => (
                <div key={cat.id}>
                  <h3 className="text-sm font-medium">{cat.name}</h3>
                  <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                    {cat.subcategories.map((sub) => (
                      <li key={sub.id}>
                        {sub.name}
                        {sub.isSystem && (
                          <span className="ml-2 text-xs text-primary">(system)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
