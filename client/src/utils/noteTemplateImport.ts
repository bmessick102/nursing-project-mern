export interface ParsedTemplate {
  name: string
  content: string
}

/** A delimiter line: only whitespace and 3+ dashes, e.g. "---" or "  -----  ". */
const DELIMITER = /^\s*-{3,}\s*$/

/**
 * Split pasted text into one or more templates.
 *
 * Multiple templates are separated by a line containing only dashes (>=3), e.g. "---".
 * Each template's `name` is its first non-empty line (trimmed, capped at 120 chars);
 * its `content` is the full trimmed block (including that first line).
 *
 * Empty/whitespace-only blocks (or blocks with no usable name) are skipped. If the input
 * has no delimiter line, the whole input is treated as a single template.
 */
export const parseTemplateImport = (text: string): ParsedTemplate[] => {
  if (!text) return []

  const lines = text.split(/\r\n|\r|\n/)

  // Break the lines into blocks at each delimiter line.
  const blocks: string[][] = [[]]
  for (const line of lines) {
    if (DELIMITER.test(line)) {
      blocks.push([])
    } else {
      blocks[blocks.length - 1].push(line)
    }
  }

  const parsed: ParsedTemplate[] = []
  for (const block of blocks) {
    const content = block.join('\n').trim()
    if (!content) continue // empty / whitespace-only block

    const firstNonEmpty = block.find((l) => l.trim().length > 0)
    if (!firstNonEmpty) continue // no usable name

    const name = firstNonEmpty.trim().slice(0, 120)
    if (!name) continue

    parsed.push({ name, content })
  }

  return parsed
}
