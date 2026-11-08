/* Independent analysis request adapter for SillyTavern's official ConnectionManagerRequestService.
 * Sends profile-bound requests without changing the RP connection and without persisting credentials.
 * Both Chat Completion and Text Completion are dispatched by the official service.
 */
// Remove tokens that may be echoed by an upstream provider error; never display keys in the panel.
export function redactErrorSecrets(value){
 return String(value??'')
  .replace(/(\bBearer\s+)[A-Za-z0-9._~+\/-]{10,}/gi,'$1[인증 정보 숨김]')
  .replace(/\b(?:sk|rk|pk)-[A-Za-z0-9_-]{6,}\b/g,'[인증 정보 숨김]')
  .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g,'[인증 정보 숨김]')
  .replace(/([?&](?:api[_-]?key|access_token|token|key)=)[^&#\s]+/gi,'$1[인증 정보 숨김]')
  .replace(/(\b(?:api[_ -]?key|access[_ -]?token|secret|token|authorization)\b\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,'$1[인증 정보 숨김]');
}
export function readableProfileError(error){
 const visited=new Set(),messages=[],statuses=[];
 let e=error;
 while(e!=null&&!visited.has(e)){
  if(typeof e!=='object'){
   const detail=redactErrorSecrets(e).trim();
   if(detail)messages.push(detail);
   break;
  }
  visited.add(e);
  for(const status of [e.status,e.statusCode,e.response?.status]){
   if(Number.isInteger(Number(status))&&Number(status)>=400&&Number(status)<=599)statuses.push(Number(status));
  }
  if(typeof e.message==='string'){
   for(const part of e.message.split(/\s*(?:→|=>)\s*/)){
    const message=redactErrorSecrets(part).trim().replace(/^(?:(?:Error|저장된 프로필 호출 실패):\s*)+/gi,'').trim();
    if(message)messages.push(message);
   }
  }
  e=e.cause;
 }
 const unique=[...new Set(messages)];
 const generic=/^(?:API request failed|Response not OK|저장된 프로필 호출 실패)$/i;
 const status=statuses[0];
 const useful=(status||unique.some(x=>!generic.test(x)))?unique.filter(x=>!generic.test(x)):unique;
 if(status&&!useful.some(x=>new RegExp(`\\b(?:HTTP\\s*)?${status}\\b`).test(x)))useful.unshift(`HTTP ${status}`);
 return (useful.join(' → ')||redactErrorSecrets(error instanceof Error?error.message:error||'원인 미확인')).slice(0,800);
}
const textOfPart=p=>typeof p==='string'?p:(p&&typeof p==='object'&&(p.type===undefined||p.type==='text'||p.type==='output_text')&&typeof p.text==='string'?p.text:'');
const textOfContent=c=>typeof c==='string'?c:Array.isArray(c)?c.map(textOfPart).join(''):'';
// Normalize the response shapes returned by Chat Completion, Text Completion, Claude and Gemini profiles.
// Reasoning/thinking text is intentionally NOT returned as an answer.
export function extractedText(value){
 if(typeof value==='string')return value;
 if(!value||typeof value!=='object')return '';
 const candidates=[
  textOfContent(value.content),
  textOfContent(value.choices?.[0]?.message?.content),
  typeof value.choices?.[0]?.text==='string'?value.choices[0].text:'',
  textOfContent(value.candidates?.[0]?.content?.parts),
  typeof value.output_text==='string'?value.output_text:'',
  typeof value.response==='string'?value.response:'',
  typeof value.text==='string'?value.text:''
 ];
 return candidates.find(t=>typeof t==='string'&&t.trim())||'';
}
// True when the provider returned reasoning but no answer, i.e. the output budget was spent while thinking.
export function hasReasoningOnly(value){
 if(!value||typeof value!=='object')return false;
 const reasoning=[value.reasoning,value.reasoning_content,value.choices?.[0]?.message?.reasoning_content,value.choices?.[0]?.message?.reasoning];
 return !extractedText(value).trim()&&reasoning.some(r=>typeof r==='string'&&r.trim());
}
export class EmptyProfileResponseError extends Error{
 constructor(message,{reasoningOnly=false,maxTokens=0}={}){super(message);this.name='EmptyProfileResponseError';this.reasoningOnly=reasoningOnly;this.maxTokens=maxTokens;}
}
export function profileErrorHint(error){
 const e=readableProfileError(error).toLowerCase();
 if(/추론.*출력 토큰|reasoning.*token/.test(e))return '추론(thinking) 모델이 출력 토큰을 사고 과정에 모두 사용했습니다. 모델의 추론 강도·thinking 예산을 낮추거나, 분석 출력 토큰 한도를 늘리세요.';
 if(/vertex ai express|vertex.*express mode/.test(e))return 'Vertex AI Express용 API 키를 SillyTavern 연결 설정에 등록한 뒤 해당 프로필을 갱신하세요.';
 if(/profile not found|연결 프로필을 찾지|연결 프로필이 없거나 지원되지|프로필의 api 형식이 지원되지/.test(e))return '저장된 연결 프로필이 없거나 지원되지 않습니다. 연결 관리자에서 프로필을 다시 선택하고 저장 상태를 확인하세요.';
 if(/\b401\b|unauthoriz|authenticat|api key|invalid key|credential/.test(e))return 'API 인증 정보를 확인하세요. 공급자별 API 키 또는 자격 증명을 등록한 뒤 연결 프로필을 갱신하세요.';
 if(/\b403\b|forbidden|permission denied/.test(e))return 'API 계정 권한, 접근 제한 및 사용 가능 모델을 확인하세요.';
 if(/\b404\b|model.*not found|unknown model/.test(e))return '저장 프로필의 모델명과 API 주소를 확인하세요.';
 if(/\b429\b|rate.?limit|quota/.test(e))return 'API 사용량 제한 또는 할당량을 확인하세요.';
 if(/\b408\b|\b504\b|timed? ?out|timeout/.test(e))return '요청 시간이 초과되었습니다. 공급자 서버 상태와 연결 설정을 확인한 뒤 다시 시도하세요.';
 if(/\b400\b|\b422\b|bad request|invalid request/.test(e))return 'API 요청 형식과 저장된 모델·프리셋 설정을 확인하세요.';
 if(/\b5\d\d\b|internal server error|bad gateway|service unavailable/.test(e))return 'API 또는 중간 서버 오류입니다. 공급자 및 SillyTavern 서버 로그를 확인하고 다시 시도하세요.';
 if(/response not ok|api request failed/.test(e))return 'API 요청은 실패했지만 상세 오류가 전달되지 않았습니다. SillyTavern에서 해당 모델의 일반 응답을 먼저 확인하고, 서버 로그의 인증·모델 오류를 점검하세요.';
 if(/failed to fetch|networkerror|network error|fetch failed/.test(e))return '서버 연결 상태, API 주소 및 네트워크 설정을 확인하세요.';
 if(/응답|empty|content|텍스트/.test(e))return '응답 본문이 비어 있습니다. 모델 출력 설정과 프리셋을 확인하세요.';
 return '브라우저 개발자 도구 콘솔에서 [그날의 사정] 오류를 확인하고, SillyTavern 서버 로그도 함께 확인하세요.';
}
export async function requestUsingProfile(service,profileId,systemPrompt,prompt,maxTokens=5000){
 if(!service||typeof service.sendRequest!=='function')throw new Error('저장된 프로필 요청 서비스가 없습니다.');
 const profile=service.getProfile?.(profileId);
 if(!profile)throw new Error('저장된 연결 프로필을 찾지 못했습니다.');
 // Do NOT branch on getContext().CONNECT_API_MAP: it is not a stable public source for
 // third-party extensions. The official service validates the saved profile and handles
 // text / chat formats itself, including instruct-prompt conversion for text completions.
 if(typeof service.validateProfile==='function')service.validateProfile(profile);
 else if(typeof service.isProfileSupported==='function'&&!service.isProfileSupported(profile))throw new Error('선택한 연결 프로필의 API 형식이 지원되지 않습니다.');
 const messages=[{role:'system',content:String(systemPrompt)},{role:'user',content:String(prompt)}];
 const attempt=async tokens=>{
  const result=await service.sendRequest(profileId,messages,tokens,
   {stream:false,extractData:true,includePreset:false,includeInstruct:true});
  const response=extractedText(result);
  if(response.trim())return response;
  const reasoningOnly=hasReasoningOnly(result);
  throw new EmptyProfileResponseError(reasoningOnly
   ?`추론 모델이 출력 토큰(${tokens})을 사고 과정에 모두 사용해 본문이 비어 있습니다.`
   :'저장된 프로필에서 빈 텍스트 응답을 반환했습니다.',{reasoningOnly,maxTokens:tokens});
 };
 try{
  try{return await attempt(maxTokens);}
  catch(first){
   // Only an empty answer is retried (once, with a larger output budget). API errors keep their real cause.
   if(!(first instanceof EmptyProfileResponseError))throw first;
   const boosted=Math.min(16000,Math.max(Math.ceil(maxTokens*1.5),maxTokens+1500));
   try{return await attempt(boosted);}
   catch(second){
    if(second instanceof EmptyProfileResponseError)throw new EmptyProfileResponseError(`${second.message} (출력 한도를 ${maxTokens}→${boosted}로 늘려 1회 재시도했으나 동일)`,{reasoningOnly:second.reasoningOnly||first.reasoningOnly,maxTokens:boosted});
    throw second;
   }
  }
 }catch(e){
  throw new Error(`저장된 프로필 호출 실패: ${readableProfileError(e)}`,{cause:e});
 }
}
