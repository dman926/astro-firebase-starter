import type { HTMLFormAttributes } from "svelte/elements";
import type { GalleryText, ImageText, ProductText } from "~types/firestore";
import type { GetImagesResult } from "../useEditor";

export interface EditFormProps<T extends GalleryText | ProductText>
  extends Omit<HTMLFormAttributes, "on:submit"> {
  docData: T;
  images: GetImagesResult | undefined | null;
  baseCaptions: ImageText[];
  // eslint-disable-next-line no-unused-vars
  "on:submit"?: (e: { done?: () => void }) => void;
}
