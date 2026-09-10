export type CategoryKey = "road" | "slide" | "tree" | "flood" | "other";

export const CATEGORIES: Record<
  CategoryKey,
  { label: string; letter: string; color: string }
> = {
  road: { label: "道路損傷", letter: "道", color: "#B8461D" },
  slide: { label: "土砂・崩落", letter: "土", color: "#4B6350" },
  tree: { label: "倒木", letter: "倒", color: "#A17A22" },
  flood: { label: "浸水", letter: "浸", color: "#37647F" },
  other: { label: "その他", letter: "他", color: "#565A4E" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export function categoryOf(key: string) {
  return CATEGORIES[(key as CategoryKey) in CATEGORIES ? (key as CategoryKey) : "other"];
}
