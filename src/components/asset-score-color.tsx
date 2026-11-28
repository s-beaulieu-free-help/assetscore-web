"use client";

import { useLayoutEffect } from "react";

const WORD = /AssetScores?/g;

function paintAssetScore(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let current = walker.nextNode(); current; current = walker.nextNode()) {
    nodes.push(current as Text);
  }

  for (const node of nodes) {
    const value = node.nodeValue;
    if (!value || !value.includes("AssetScore")) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    if (parent.closest("script, style, textarea, svg, noscript, [data-brand], .bg-accent")) continue;
    WORD.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let last = 0;
    let matched = false;
    for (const match of value.matchAll(WORD)) {
      matched = true;
      const index = match.index ?? 0;
      if (index > last) fragment.append(value.slice(last, index));
      const mark = document.createElement("span");
      mark.className = "text-accent";
      mark.dataset.brand = "1";
      mark.textContent = match[0];
      fragment.append(mark);
      last = index + match[0].length;
    }
    if (!matched) continue;
    if (last < value.length) fragment.append(value.slice(last));
    node.replaceWith(fragment);
  }
}

export function AssetScoreColor() {
  useLayoutEffect(() => {
    let frame = 0;
    let painting = false;
    const run = () => {
      painting = true;
      paintAssetScore(document.body);
      painting = false;
    };
    run();
    const observer = new MutationObserver(() => {
      if (painting) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
