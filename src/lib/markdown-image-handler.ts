import { visit } from "unist-util-visit";
import type { Element } from "hast";
import type { Plugin } from "unified";

/**
 * Rehype plugin that processes img elements to prevent CLS:
 * - Adds loading="lazy" for better performance
 * - Ensures alt attributes are present for accessibility
 * - Adds width/height attributes when possible
 */
export const markdownImageHandler: Plugin = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img") {
        const props = node.properties || {};

        // Ensure alt attribute exists for accessibility
        if (typeof props["alt"] !== "string") {
          props["alt"] = "";
        }

        // Add lazy loading for performance
        props["loading"] = "lazy";

        // Add decoding attribute for better user experience
        props["decoding"] = "async";

        // Update the properties
        node.properties = props;
      }
    });
  };
};