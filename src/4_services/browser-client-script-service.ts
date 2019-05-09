export function loadScript(src: string) {
  return new Promise(function (resolve: any, reject: any) {
    let s;
    s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    if (document && document.head) {
      document.head.appendChild(s);
    }
  });
}

export function scrollBodyTop() {
  window.document.getElementsByTagName('body')[0].scrollIntoView();
}
