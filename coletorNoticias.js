const endpoints = [
  {url : "https://esportes.r7.com/futebol/feed.xml", fonte:"Fonte: R7.com"},
  {url : "https://br.investing.com/rss/news_25.rss", fonte:"Fonte: Investing.com"},
  {url : "https://www.gazetadopovo.com.br/feed/rss/bomgourmet.xml", fonte:"Fonte: gazetadopovo.com.br"}
];

//Numero de notícias de cada endpoint ex: 5 terá 15 notícias, 5 de cada
const num_noticias = 5;

var noticias = [];

//Captura elemento <ul id="container-noticias"> que possui id="container-noticias" e é pai de todos os slides (elementos <li>)
var $container_noticias = document.getElementById('container-noticias');

//agora capturamos o primeiro slide(elemento filho <li>) do elemento acima para usar como template
//futuramente ao capturar as noticias da API vamos clonar esse elemento para cada noticia e alterar os atributos de imagem e titulo
var $slide_template = $container_noticias.firstElementChild;

//Colate noticias de todos os endpoints e retorna uma promise array para cada endpoint
function coletaNoticias()
{
  console.log("Executando coletaNoticias()");

  //Promise.all faz com que possamos agrupar várias promises em um único objeto
  //muito util para esse caso onde vamos precisar fazer várias requisições ao mesmo tempo
  //para lugares diferentes
  return Promise.all
  (
    //metodo MAP faz com que possamos rodar uma função para cada item do array
    //nesse caso estamos rodando o fetch para cada valor no array endpoints
    endpoints.map(endpoint => fetch(endpoint.url)
      .then(response => {
        return response.text();
      })
    )
  ).then(response => {

    //Lembrando que essa response só retorna após todos os endpoints retornarem uma resposta
    //Essa response possui um array com a resposta de cada endpoint
    console.log(response);
    return response;
  })
}


function montaNoticiasSlider()
{
  //Coleta as noticias e processa
  coletaNoticias().then(feeds => {

    let parser = new DOMParser();

    //vamos iterar nos feeds de cada endpoint, um após o outro
    for (var i = 0; i < feeds.length; i++)
    {
      let xml = parser.parseFromString(feeds[i], 'text/xml');

      //Captura os items do feed
      let feed = xml.getElementsByTagName('item');

      //2 dos 3 feeds utilizam a tag item para armazenar as noticias, o terceiro utiliza a tag entry
      //então vamos testar primeiro buscando pela tag item, se retornar 0 resultados quer dizer que o XML não possui
      //a tag item, neste caso vamos realizar uma nova busca pela tag entry
      if(feed.length <= 0)
      {
        //tag item não existe, retornou length 0. Então buscamos pela tag Entry
        feed = xml.getElementsByTagName('entry');
      }

      console.log("FEED", feed);

      //Adiciona feed de noticias no array noticias
      noticias.push(feed);
    }

    console.log("NOTICIAS", noticias);

    //Em seguida vamos capturar o numero de noticias configurado de cada endpoint
    //Ex se num_noticias = 5 então vai capturar 5 noticias de cada feed
    for (var i = 0; i < num_noticias; i++)
    {
      //Esse loop itera por cada endpoint, no nosso exemplo o valor de noticias.length será 3
      //pois temos 3 endpoints
      for (var i2 = 0; i2 < noticias.length; i2++)
      {
        //o primeiro iterador i2 acessa os 3 feeds, o segundo iterador i acessa a noticia de cada feed
        //exemplo: noticias[0][0] (feed 0 e noticia 0) noticias[1][0] (feed 1 e noticia 1) noticias[1][1] (feed 1 noticia 2) e assim por diante
        let feed = noticias[i2][i];

        //Abaixo montamos o html de cada noticia do slider igual nos exemplos anteriores
        let campo = {}

        console.log('gerando slide ' + i);

        //Clona o slide (<li>) com toda sua hierarquia
        $novo_slide = $slide_template.cloneNode(true);

        //capturo o elemento <img> do slide atual buscando pela classe img-noticia
        $img = $novo_slide.getElementsByClassName('img-noticia')[0];

        //capturo o elemento que segura o texto da noticia pela classe texto-noticia
        $texto_noticia = $novo_slide.getElementsByClassName('texto-noticia')[0];

        /***** QRCODE INICIO *****/

        //capturo o elemento que segura o QRCODE da noticia pela classe qrcode-noticia
        $qrcode_noticia = $novo_slide.getElementsByClassName('qrcode-noticia')[0];

        //captura URL da noticia no XML
        //Observando os XMLS atuais existem 2 estruturas diferentes para URL de notícia, tag url e tag link
        //Primeiro tenta capturar a URL pela tag URL
        let url = feed.getElementsByTagName('url');

        //Se não existe tag URL tenta buscar por tag LINK
        if(url.length <= 0)
        {
          url = feed.getElementsByTagName('link');
        }

        //Extrai o texto da URL capturada acima
        url = url[0].textContent;

        console.log("URL PARA QRCODE: " + url);

        //Gera o QRCODE dentro do nosso elemento qrcode-noticia desta noticia
        var qrcode = new QRCode($qrcode_noticia, {
          text: url,
          width: 128,
          height: 128,
          colorDark : "#000000",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
        });

        /***** QRCODE FIM *****/

        campo['titulo'] = feed.getElementsByTagName('title')[0].textContent

        console.log("TITULO", campo['titulo']);

        $enclosure = feed.getElementsByTagName('enclosure');

        console.log('Numero de tags enclosure detectados nesse item: ' + $enclosure.length);

        //Se item possui elemento enclosure, captura imagem de enclosure
        if($enclosure.length > 0)
        {
          campo['imagem'] = feed.getElementsByTagName('enclosure')[0].getAttribute('url');

          //Altera atributo src da imagem do slide
          $img.setAttribute('src', campo['imagem']);
        }

        //Se item possui elemento mediaurl, captura imagem de mediaurl
        if(feed.getElementsByTagName('mediaurl').length > 0)
        {
          campo['imagem'] = feed.getElementsByTagName('mediaurl')[0].innerHTML;
        }

        //Se imagem for vazia, pula notícia e não inclui no slider
        if(!campo['imagem'])
        {
          continue;
        }

        console.log("IMAGEM", campo['imagem']);

        //Altera atributo src da imagem do slide
        $img.setAttribute('src', campo['imagem']);

        //Altera o HMLT do elemento <p class="texto-noticia">
        $texto_noticia.innerHTML = campo['titulo'];

        //Adiciona o elemento <li> inteiro do slide modificado no <ul> do slide
        $container_noticias.appendChild($novo_slide);

        campo['fonte'] = 'Investing';

      }
    }

    $slide_template.remove();

  }).then(() => {

    initSlider();

  });
}

function initSlider()
{
  console.log("Inicializando slider");
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
}



//Roda função
montaNoticiasSlider();

//A cada 60 segundos da refresh na página para pegar novas notícias
setInterval(function(){
  console.log("Refreshing");
  location.reload();
  }, 60000);
