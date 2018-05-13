export function chunck (arr, size = 1) {

  const length = arr === null ? 0 : arr.length
  if (!length) {
    return []
  }

  const ret = []
  let index = 0
  while (index < length) {
    ret.push(arr.slice(index, index + size))
    index += size
  }

  return ret
}
