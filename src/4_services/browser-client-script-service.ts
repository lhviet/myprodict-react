export const loadScript = (src: string) => new Promise(function (resolve: any, reject: any) {
  let s;
  s = document.createElement('script');
  s.src = src;
  s.onload = resolve;
  s.onerror = reject;
  if (document && document.head) {
    document.head.appendChild(s);
  }
});

export const scrollBodyTop = () => window && window.document.getElementsByTagName('body')[0].scrollIntoView();
