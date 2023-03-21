export const mergeCookies = (a: string, b: string): string => {
  const aArr = a.split('; ');
  const bArr = b.split('; ');
  const mergedArr = [...aArr];

  for (const bStr of bArr) {
    const [bKey, bVal] = bStr.split('=');
    let replaced = false;
    for (let i = 0; i < mergedArr.length; i += 1) {
      const aStr = mergedArr[i];
      const [aKey] = aStr.split('=');
      if (aKey === bKey) {
        mergedArr[i] = `${bKey}=${bVal}`;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      mergedArr.push(`${bKey}=${bVal}`);
    }
  }

  return mergedArr.join('; ');
};
