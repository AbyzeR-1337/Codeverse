// Сборка веб-страницы для предпросмотра: встраиваем CSS/JS из соседних файлов и
// перехватываем console.*, чтобы показывать логи страницы в панели вывода IDE.

const CONSOLE_BRIDGE = `<script>
(function(){
  function fmt(a){try{return typeof a==='string'?a:JSON.stringify(a)}catch(e){return String(a)}}
  ['log','info','warn','error'].forEach(function(k){
    var orig=console[k];
    console[k]=function(){var args=[].slice.call(arguments);parent.postMessage({__cv:true,stream:k,text:args.map(fmt).join(' ')},'*');orig.apply(console,args)};
  });
  window.addEventListener('error',function(e){parent.postMessage({__cv:true,stream:'error',text:e.message+' (строка '+e.lineno+')'},'*')});
})();
</script>`;

/** files: путь относительно папки страницы → содержимое. */
export function buildPreview(html: string, files: Record<string, string>): string {
  let doc = html;
  doc = doc.replace(/<link\b[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (m, href: string) => (href in files ? `<style>\n${files[href]}\n</style>` : m));
  doc = doc.replace(/<script\b([^>]*)src=["']([^"']+\.js)["']([^>]*)><\/script>/gi, (m, pre: string, src: string, post: string) =>
    src in files ? `<script${pre}${post}>\n${files[src].replace(/<\/script>/g, '<\\/script>')}\n</script>` : m,
  );
  if (/<head[^>]*>/i.test(doc)) doc = doc.replace(/<head[^>]*>/i, (h) => h + CONSOLE_BRIDGE);
  else doc = CONSOLE_BRIDGE + doc;
  return doc;
}
