function noticias() {
 fetch(`https://br.investing.com/rss/news_25.rss`)
     .then(response => response.text())
     .then(data => {
      let parser = new DOMParser()
      let xml = parser.parseFromString(data, 'text/xml')
      let feed = xml.getElementsByTagName('item')
      let noticias = []

      for (let i = 1; i < 5; i++) {
          let campo = {}
          campo['titulo'] = feed[i].getElementsByTagName('title')[0].innerHTML
          campo['imagem'] =  $(data).find("enclosure").attr('url');
          //campo['imagem'] = feed[i].getElementsByTagName('enclosure')[0].innerHTML


          campo['fonte'] = 'Investing';
          noticias[i] = campo
          
         document.getElementById('noticia').innerHTML = `${campo.titulo}`;
         document.getElementById('fonte').innerHTML = `Fonte: <b>${campo.fonte}</b>`;
         //document.getElementById('foto-noticia').src = "img/slides/01.jpg";
        console.log(campo.titulo + campo.imagem); 
               
     }
      
  }) 
     
}
noticias();


/*
function noticias() {
  fetch(`https://br.investing.com/rss/news_25.rss`)

  .then(response => response.text())
  .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
  .then(data => {
    console.log(data);
    const items = data.querySelectorAll("item");
    let html = ``;
    
    items.forEach(el => {
      
      var url =  $(data).find("enclosure").attr('url');
      console.log(url);

      html += `
        <article>
          <img src="${url}" alt="">
          <h2>
            <a href="${el.querySelector("link").innerHTML}" target="_blank" rel="noopener">
              ${el.querySelector("title").innerHTML}
            </a>
          </h2>
        </article>
      `;
    });
    document.body.insertAdjacentHTML("beforeend", html);
    
  });
}
 */