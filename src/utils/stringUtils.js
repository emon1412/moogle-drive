export const createNameForDuplicate = (fileName, lastestFileWithSameName) => {
  const [fileNameWithoutExtension, extension] = fileName.split('.');
  const nextIncrementNumber = Number((lastestFileWithSameName.name.match(/\(([^)]+)\)/) || [])[1] || 0) + 1;
  return `${fileNameWithoutExtension}(${nextIncrementNumber}).${extension}`;
} 