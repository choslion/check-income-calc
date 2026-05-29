const CHOSUNG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

// 한글 자음 범위 (ㄱ=0x3131 ~ ㅎ=0x314E)
function isChosung(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= 0x3131 && code <= 0x314E
}

// 모든 글자가 초성인지 확인
export function isAllChosung(str: string): boolean {
  return str.length > 0 && str.split('').every(isChosung)
}

// 문자열에서 초성만 추출
export function extractChosung(str: string): string {
  return str
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0) - 0xAC00
      if (code < 0 || code > 11171) return char
      return CHOSUNG_LIST[Math.floor(code / (21 * 28))]
    })
    .join('')
}

// 초성 검색: query가 전부 초성이면 초성 비교, 아니면 false
export function matchChosung(text: string, query: string): boolean {
  if (!isAllChosung(query)) return false
  const textChosung = extractChosung(text)
  return textChosung.includes(query)
}
