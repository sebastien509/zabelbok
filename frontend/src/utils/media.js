export function getCloudinaryThumbnail(url) {
    if (!url?.includes('/upload/')) return url;
    return url
      .replace('/upload/', '/upload/so_1,fl_jpeg,w_320,h_180,c_fill/')
      .replace('.mp4', '.jpg');
  }
  