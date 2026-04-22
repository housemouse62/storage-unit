const formatFileSize = (size) => {
  if (!size) return;
  if (size > 999999999) {
    return (size / 1000000000).toFixed(2) + " GB";
  } else if (size > 999999) {
    return (size / 1000000).toFixed(2) + " MB";
  } else if (size > 999) {
    return (size / 1000).toFixed(2) + " KB";
  } else return size + " bytes";
};

export default formatFileSize;
