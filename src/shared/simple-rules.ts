export const SIMPLE_RULE_TYPES = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'DOMAIN-REGEX',
  'DOMAIN-WILDCARD',
  'GEOSITE',
  'GEOIP',
  'SRC-GEOIP',
  'IP-ASN',
  'SRC-IP-ASN',
  'IP-CIDR',
  'IP-CIDR6',
  'SRC-IP-CIDR',
  'IP-SUFFIX',
  'SRC-IP-SUFFIX',
  'SRC-PORT',
  'DST-PORT',
  'IN-PORT',
  'DSCP',
  'PROCESS-NAME',
  'PROCESS-PATH',
  'PROCESS-NAME-REGEX',
  'PROCESS-PATH-REGEX',
  'PROCESS-NAME-WILDCARD',
  'PROCESS-PATH-WILDCARD',
  'NETWORK',
  'UID',
  'IN-TYPE',
  'IN-USER',
  'IN-NAME',
  'REMATCH-NAME',
  'RULE-SET',
  'AND',
  'OR',
  'NOT',
  'SUB-RULE',
  'MATCH'
]

// Split only top-level commas: logical rules contain nested expressions.
export function ruleParts(rule: string): string[] {
  let depth = 0
  let start = 0
  const parts: string[] = []
  for (let i = 0; i < rule.length; i++) {
    if (rule[i] === '(') depth++
    if (rule[i] === ')') depth--
    if (rule[i] === ',' && depth === 0) {
      parts.push(rule.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(rule.slice(start).trim())
  return parts
}

export function parseSimpleRule(rule: string): {
  type: string
  payload: string
  target: string
  options: string[]
} {
  const parts = ruleParts(rule)
  const options: string[] = []
  const minimumParts = parts[0] === 'MATCH' ? 2 : 3
  while (parts.length > minimumParts) {
    const option = parts.at(-1)
    if (!option || !['no-resolve', 'src'].includes(option)) break
    options.unshift(option)
    parts.pop()
  }
  const type = parts.shift() || 'DOMAIN-SUFFIX'
  const target = parts.pop() || ''
  return { type, payload: parts.join(','), target, options }
}

function mapRuleSets(rule: string, replace: (name: string) => string): string {
  const parts = ruleParts(rule)
  const next = [...parts]
  if (parts[0] === 'RULE-SET' && parts[1]) next[1] = replace(parts[1])
  else if (['AND', 'OR', 'NOT', 'SUB-RULE'].includes(parts[0])) {
    if (parts[1]) next[1] = mapRuleSets(parts[1], replace)
  } else if (parts.every((part) => part.startsWith('(') && part.endsWith(')'))) {
    for (let i = 0; i < parts.length; i++)
      next[i] = `(${mapRuleSets(parts[i].slice(1, -1), replace)})`
  }
  return next.some((part, i) => part !== parts[i]) ? next.join(',') : rule
}

export function renameRuleSet(rule: string, before: string, after: string): string {
  return mapRuleSets(rule, (name) => (name === before ? after : name))
}

export function ruleSetNames(rule: string): string[] {
  const names: string[] = []
  mapRuleSets(rule, (name) => {
    names.push(name)
    return name
  })
  return names
}
