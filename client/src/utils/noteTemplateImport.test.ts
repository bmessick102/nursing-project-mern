import { parseTemplateImport } from './noteTemplateImport'

describe('parseTemplateImport', () => {
  it('parses a single block using the first line as the name and full block as content', () => {
    const text = [
      'Procedure Note: Colonoscopy',
      'Patient Name:',
      'DOB: ...',
      '',
      'Impression & Plan',
      'Successful screening colonoscopy ...',
    ].join('\n')

    const result = parseTemplateImport(text)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Procedure Note: Colonoscopy')
    // Content keeps the full block, including the name line and later sections.
    expect(result[0].content).toContain('Procedure Note: Colonoscopy')
    expect(result[0].content).toContain('Impression & Plan')
  })

  it('splits two blocks separated by a dashed delimiter line into two templates', () => {
    const text = [
      'Progress Note',
      'Body of the first note.',
      '---',
      'Assessment Note',
      'Body of the second note.',
    ].join('\n')

    const result = parseTemplateImport(text)

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Progress Note')
    expect(result[1].name).toBe('Assessment Note')
    expect(result[0].content).toContain('Body of the first note.')
    expect(result[1].content).toContain('Body of the second note.')
  })

  it('skips empty and whitespace-only blocks', () => {
    const text = ['First Template', 'Content one.', '---', '   ', '---', ''].join('\n')

    const result = parseTemplateImport(text)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('First Template')
  })

  it('caps a name longer than 120 characters to 120 characters', () => {
    const longName = 'A'.repeat(200)
    const result = parseTemplateImport(`${longName}\nSome body text.`)

    expect(result).toHaveLength(1)
    expect(result[0].name).toHaveLength(120)
    expect(result[0].name).toBe('A'.repeat(120))
  })

  it('uses the first non-empty line as the name when blank lines precede the title', () => {
    const text = ['', '   ', 'Discharge Summary', 'Details follow.'].join('\n')

    const result = parseTemplateImport(text)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Discharge Summary')
  })

  it('treats input with no delimiter as a single template', () => {
    const result = parseTemplateImport('Just one line')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Just one line')
  })
})
