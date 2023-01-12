function noticias() {

  //Captura elemento <ul id="container-noticias"> que possui id="container-noticias" e é pai de todos os slides (elementos <li>)
 $container_noticias = document.getElementById('container-noticias');
 //agora capturamos o primeiro slide(elemento filho <li>) do elemento acima para usar como template
 //futuramente ao capturar as noticias da API vamos clonar esse elemento para cada noticia e alterar os atributos de imagem e titulo
 $slide_template = $container_noticias.firstElementChild;

 //array que servirá de container para os novos slides(<li>s) criados
 $slides = [];

 fetch(`https://br.investing.com/rss/news_25.rss`)
     .then(response => response.text())
     .then(data => {

      let parser = new DOMParser()
      let xml = parser.parseFromString(data, 'text/xml')
      let feed = xml.getElementsByTagName('item')
      let noticias = []

      console.log('--------------------', data, '--------------------')

      for (let i = 1; i < 5; i++) {
          let campo = {}

          console.log('gerando slide ' + i);


          //Clona o slide (<li>) com toda sua hierarquia
          $novo_slide = $slide_template.cloneNode(true);

          //capturo o elemento <img> do slide atual buscando pela classe img-noticia
          $img = $novo_slide.getElementsByClassName('img-noticia')[0];

          //capturo o elemento que segura o texto da noticia pela classe texto-noticia
          $texto_noticia = $novo_slide.getElementsByClassName('texto-noticia')[0];

          campo['titulo'] = feed[i].getElementsByTagName('title')[0].innerHTML

          $enclosure = feed[i].getElementsByTagName('enclosure');

          console.log('Numero de tags enclosure detectados nesse item: ' + $enclosure.length);

          //Se item possui elemento enclosure
          if($enclosure.length > 0)
          {
            campo['imagem'] = feed[i].getElementsByTagName('enclosure')[0].getAttribute('url');

            //Altera atributo src da imagem do slide
            $img.setAttribute('src', campo['imagem']);
          }
          else
          {
            console.log('Elemento não possui tag enclosure, slide sem imagem.');
          }

          //Altera atributo src da imagem do slide
          $img.setAttribute('src', campo['imagem']);

          //Altera o HMLT do elemento <p class="texto-noticia">
          $texto_noticia.innerHTML = campo['titulo'];

          //Adiciona o elemento <li> inteiro do slide modificado no <ul> do slide
          $container_noticias.appendChild($novo_slide);

          campo['fonte'] = 'Investing';
          noticias[i] = campo
     }

     //Deleta o primeiro slide que serviu de template
     $slide_template.remove();

     console.log($container_noticias);
      
  })
  .then(() => {


    //Inicialização do slider Revolution Slider
    //Slider só pode ser inicializado após manipulação dos elementos HTML dos slides, senão ele acaba iniciando antes e bugando.
    //Inicialização acontecia no arquivo js/theme.init.js, a mesma foi comentada e movida para esse bloco
    if ($.isFunction($.fn['themePluginRevolutionSlider']) && ( $('[data-plugin-revolution-slider]').length || $('.slider-container .slider').length )) {

      $(function() {
        $('[data-plugin-revolution-slider]:not(.manual), .slider-container .slider:not(.manual)').each(function() {
          var $this = $(this),
            opts;

          var pluginOptions = theme.fn.getOptions($this.data('plugin-options'));
          if (pluginOptions)
            opts = pluginOptions;

          $this.themePluginRevolutionSlider(opts);
        });
      });

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
