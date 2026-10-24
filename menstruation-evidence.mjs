/* Conservative story-opening evidence: never treat general discussion as an active period. */
export function openingMenstruationEvidence(text){
 const raw=String(text||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,12000);
 if(!raw)return false;
 const s=raw.toLowerCase();
 // Explicit current-state phrases only; exclude direct negation in the same clause.
 const phrases=[
  /\b(?:is|was|currently|still)\s+(?:on\s+)?(?:his|her|their|the)\s+period\b/,
  /\b(?:on|having)\s+(?:his|her|their|the)\s+period\b/,
  /\b(?:having|feeling|experiencing|suffering(?:\s+with|\s+from)?)\s+(?:intense\s+)?period\s+cramps\b/,
  /(?:현재|지금|오늘|이미|여전히|아직)[^.!?\n]{0,22}(?:생리|월경)\s*중/u,
  /(?:생리|월경)\s*중/u,
  /(?:생리통|월경통)(?:이|을|은|으로|때문에| 때문에|이\s*심|을\s*앓)/u,
 ];
 if(!phrases.some(re=>re.test(s)))return false;
 if(/\b(?:is\s+not|isn't|not|never|no\s+longer)\s+on\s+(?:his|her|their|the)\s+period\b/.test(s))return false;
 if(/(?:생리|월경)\s*중\s*(?:아니|이\s*아니|은\s*아니|가\s*아니)/u.test(s))return false;
 return true;
}
