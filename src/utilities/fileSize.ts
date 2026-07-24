const KILOBYTE = 1024;
const MEGABYTE = KILOBYTE * 1024;
const GIGABYTE = MEGABYTE * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < KILOBYTE) {
    return `${bytes} ${bytes === 1 ? "byte" : "bytes"}`;
  }

  if (bytes < MEGABYTE) {
    return `${(bytes / KILOBYTE).toFixed(1)} KB`;
  }

  if (bytes < GIGABYTE) {
    return `${(bytes / MEGABYTE).toFixed(1)} MB`;
  }

  return `${(bytes / GIGABYTE).toFixed(1)} GB`;
}
