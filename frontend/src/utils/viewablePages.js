export const lifecyclePageLabels = {
  proposal: 'Proposal',
  srs: 'SRS',
  diagrams: 'Diagrams',
  wireframes: 'Wireframes',
  modules: 'Modules',
  testCases: 'Test Cases',
  sourceCode: 'Source Code',
  evidence: 'Evidence Files',
}

export function collectViewablePages(component) {
  if (!component?.lifecycle) return []

  return Object.entries(component.lifecycle)
    .filter(([, item]) => item.viewable)
    .map(([key, item]) => ({
      id: key,
      type: item.viewable.type,
      label: lifecyclePageLabels[key] ?? key,
      ref: item.ref,
      src: item.viewable.src,
      content: item.viewable.content,
      filePath: item.viewable.filePath,
      page: item.viewable.page,
      totalPages: item.viewable.totalPages,
      fileLabel: item.viewable.fileLabel,
      imageLabel: item.viewable.imageLabel,
    }))
}
