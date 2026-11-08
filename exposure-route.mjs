/* Oral / surface deposition is not a reproductive-route exposure.
 * Shared by the analyzer (drops new events) and the engine (neutralizes already stored events on replay).
 * Deliberately tight: the location must be directly attached to the deposition verb, so a stray
 * "손"/"입술" earlier in the sentence cannot cancel a genuine internal exposure. */
const LOCATION=String.raw`(?:입\s*(?:안|속)?|혀|목구멍|목\s*안|얼굴|볼|뺨|가슴|배|등|엉덩이|허벅지|밖|바깥|체외|口(?:の中|内)?|舌|喉|顔|胸|腹)`;
const PARTICLE=String.raw`\s*(?:안|속|위)?\s*(?:에다가|에다|에\s*대고|에|으로|로|に|へ)?`;
const FILLER=String.raw`(?:\s*(?:그대로|전부|가득|듬뿍|한\s*번\s*더|결국|참지\s*못하고|마저|또))*`;
const VERB=String.raw`(?:사정|쌌|싸냈|뿌렸|쏟았|射精|出し|かけ)`;
const KOJA=new RegExp(`${LOCATION}${PARTICLE}${FILLER}\\s*${VERB}`,'u');
const ENGLISH=/\b(?:came|cum|cums|cumming|ejaculated|spilled|shot)\b[^.!?\n]{0,20}?\b(?:mouth|tongue|throat|face|chest|stomach|belly|back|outside)\b/i;
const INTERNAL=/(?:질(?:\s*(?:안|속|내|구))?(?:에|으로|에서)|질\s*(?:안|속|내)|자궁|보지|膣|子宮|vagina|womb|cervix)/iu;
export function nonReproductiveDeposition(evidence){
 const t=String(evidence||'');
 return (KOJA.test(t)||ENGLISH.test(t))&&!INTERNAL.test(t);
}
