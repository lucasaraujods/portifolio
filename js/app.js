
//a partir do documento HTML ser totalmente lido ele vai executar uma função
$(document).ready(function () {
    cardapio.eventos.init()
})

//criando um váriavel sendo orinetado ao objeto, para ficar mais fácil de se situar com os métodos juntos
var cardapio = {}

var MEU_CARRINHO = [] //array de objetos
var MEU_ENDERECO= null // é igual a null para saber somente quando o cliente informar o endereço

var VALOR_CARRINHO=0 
var VALOR_ENTREGA=5 //frente definido como 5 reais

var CELULAR_EMPRESA = '5561986183824' // celular de ref ao pedido

cardapio.eventos = {
    //criando uma função para quando inicializar e chamar os itens do menu
    init: () => {
        cardapio.metodos.obterItensCardapio() //carrega informações como nomes, preços e descrições.
        cardapio.metodos.carregarBotaoLigar() //carregar o botão de ligar, assim, ao aperter direciona para a ligação ao número
        cardapio.metodos.carregarBotaoReserva() //carrega o botão de reservar, assim, direciona para o wpp da loja
    }

}

cardapio.metodos = {
    //para listar os itens, obtendo a lista de itens pelo o parametro relacionado, assim, obtem os itens cardapio de acordo com o parametro dado do array de menu e o vermais é o botão que se inicializa como falso, não mostrando o restante do cardapio
    obterItensCardapio: (categoria = 'burgers', vermais=false) => {

        let filtro = MENU[categoria]
        console.log(filtro)

         //Manipulação com jQuery, para fazer o getelementbyID por jquery é por $("#")
        if(!vermais){
            $("#itensCardapio").html('') //aqui limpamos o conteudo do html 
            $("#btnVerMais").removeClass("hidden") //aqui remove a classe escondida, assim, mostrando os itens ao apertar o vermais = true
        }


        //*criando um for each com jquery para obter os 12 produtos e cada vez que e a repetição ele cria um template
        //o e é o elemento assim segue os 12 itens do cardápio do array
        $.each(filtro, (i,e) => {

            
            //usando o replace para substituir a variavel, pelo meu item atual sendo a variavel global de img, usand regex
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.',','))
            .replace(/\${id}/g, e.id)

            //ao clicar no ver mais exbir os 4 ultimos itens, assim total =12 itens
            if(vermais && i >=8 && i < 12){
                $("#itensCardapio").append(temp)
            }
            //paginação inicial = 8 itens
            if(!vermais && i < 8){
                $("#itensCardapio").append(temp)
            }
          
        })

        //removendo o ativo para o click, ou seja, a parte amarelha deve ser removida o active
        $(".container-menu a").removeClass('active')

        // coloca o menu para ativo
        $('#menu-' + categoria).addClass('active')
    },

    verMais: () => {

        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1] //menu burgers, assim o split quebra o array e pega o nome no array 1
        cardapio.metodos.obterItensCardapio(ativo,true)

        $("#btnVerMais").addClass('hidden')
    },

    //diminuir a quantidade do item no cardapio
    diminuirQuantidade: (id) => {

        let qntdAtual =parseInt($("#qntd-" + id).text()) 

        if(qntdAtual > 0){

            $("#qntd-" + id).text(qntdAtual-1)

        }
    },

    //aumentar a quantidade do item no cardapio
    aumentarQuantidade: (id) => {

        let qntdAtual =parseInt($("#qntd-" + id).text())

        $("#qntd-" + id).text(qntdAtual+1)
    },

    //adicionar ao carrinho o item do cardapio
    adicionarAoCarrinho: (id) => {

        let qntdAtual =parseInt($("#qntd-" + id).text())

        if(qntdAtual>0){

            //obter a cateoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1]

            // obtem a lista de itens
            let filtro = MENU[categoria]

            // obte item 
            let item = $.grep(filtro, (e,i) => {return e.id == id})

            if(item.length > 0){

                //VALIDAR se já existe esse item no carrinho, so retorna se o elemento for igual ao id do item, assim filtrando para se caso adicionar mais um item, ele fazer a soma do que já estão selecionados e adicionados
                let existe= $.grep(MEU_CARRINHO, (elem, index) => {return elem.id == id})

                //pegamso a posição do item e altera a qntd dele, se ele existir, assim, usando o método de encontrar o index do item para adicionar a quantidade dada no memsmo item, assim retorna a posição no carrinho
                if(existe.length > 0){

                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id))
                    //acesso ao meu carrinho, passando a posição do elemento acima e quantidade, assim vai ser igual a quantidade que já existe mais a quantidade atual escolhida pela usuario 
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual

                }
                //se nao existir o item no carrinho, adiiciona ele
                else{
                    item[0].qntd = qntdAtual
                    MEU_CARRINHO.push(item[0])
                }

                //chamando a função para retornar a mensagem de algo foi colocado no carrinho
                cardapio.metodos.mensagem('item adicionado ao carrinho', 'green')
                //ao adicionar, o número 0 retorna para o inicial
                $("#qntd-" + id).text(0)

                //chamando a função para adicionar ao carrinho
                cardapio.metodos.atualizarBagdeTotal()

            }
        }
    },

    //atualiza o iconezinho flutuante quanyo o meu carrinho lá de cima
    atualizarBagdeTotal: () => {

        var total= 0

        $.each(MEU_CARRINHO, (i,e) => {
            total +=e.qntd
        })

        if(total > 0){
            $(".botao-carrinho").removeClass('hidden')
            $(".container-total-carrinho").removeClass('hidden')
        }
        else{
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden')
        }

        $(".badge-total-carrinho").html(total)

    },

    //abrir a pagina de carrinho:
    abrirCarrinho: (abrir) => {

        if(abrir){
            $("#modalCarrinho").removeClass('hidden')
            cardapio.metodos.carregarCarrinho()
        }
        else{
            $("#modalCarrinho").addClass('hidden')
        }

    },

    //altera os textos e exibe os botões das etapas 
    carregarEtapa: (etapa) => {
        if(etapa ==1){
            $("#lblTituloEtapa").text('Seu carrinho:')
            $("#itensCarrinho").removeClass("hidden")
            $("#localEntrega").addClass("hidden")
            $("#resumoCarrinho").addClass("hidden")

            $(".etapa").removeClass('active')
            $(".etapa1").addClass('active')

            $("#btnEtapaPedido").removeClass('hidden')
            $("#btnEtapaEndereco").addClass('hidden')
            $("#btnEtapaResumo").addClass('hidden')
            $("#btnVoltar").addClass('hidden')
        
        }
        if(etapa ==2){
            $("#lblTituloEtapa").text('Endereço de entrega:')
            $("#itensCarrinho").addClass("hidden")
            $("#localEntrega").removeClass("hidden")
            $("#resumoCarrinho").addClass("hidden")

            $(".etapa").removeClass('active')
            $(".etapa1").addClass('active')
            $(".etapa2").addClass('active')


            $("#btnEtapaPedido").addClass('hidden')
            $("#btnEtapaEndereco").removeClass('hidden')
            $("#btnEtapaResumo").addClass('hidden')
            $("#btnVoltar").removeClass('hidden')
        }
        if(etapa ==3){
            $("#lblTituloEtapa").text('Resumo do pedido:')
            $("#itensCarrinho").addClass("hidden")
            $("#localEntrega").addClass("hidden")
            $("#resumoCarrinho").removeClass("hidden")

            $(".etapa").removeClass('active')
            $(".etapa1").addClass('active')
            $(".etapa2").addClass('active')
            $(".etapa3").addClass('active')


            $("#btnEtapaPedido").addClass('hidden')
            $("#btnEtapaEndereco").addClass('hidden')
            $("#btnEtapaResumo").removeClass('hidden')
            $("#btnVoltar").removeClass('hidden')
        }
    },

    //botão de voltar etapas
    voltarEtapa: () => {
        //buscando a etapa que está ativa para voltar
        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa-1)
    },

    //carrega as listas de itens do carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1)
        
        if(MEU_CARRINHO.length> 0){

            //limpando a pagina
            $("#itensCarrinho").html('')

            $.each(MEU_CARRINHO, (i,e) => {

                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${id}/g, e.id)
                .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp)

                //ultimo item do carrinho:
                if((i+1) == MEU_CARRINHO.length){

                    cardapio.metodos.carregarValores()
                }
                

            })

        }else{
            $("#itensCarrinho").html('<p class="carrinho-vazio"> <i class= "fa fa-shopping-bag"></i> Seu carrinho está vazio </p>')
            cardapio.metodos.carregarValores()
        }


    },

    diminuirQuantidadeCarrinho: (id) =>{

        let qntdAtual =parseInt($("#qntd-carrinho-" + id).text()) 

        if(qntdAtual > 1){

            $("#qntd-carrinho-" + id).text(qntdAtual-1)
            cardapio.metodos.atualizarCarrinho(id, qntdAtual-1)

        }
        else{
            cardapio.metodos.removerItemCarrinho(id)
        }

    },

    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual =parseInt($("#qntd-carrinho-" + id).text()) 
        $("#qntd-carrinho-" + id).text(qntdAtual+1)
        cardapio.metodos.atualizarCarrinho(id, qntdAtual+1)
    },
    //botão remover item do carrinho
    removerItemCarrinho: (id) => {

        //retorna a lista com ids diferentes
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e,i) => {return e.id != id} )
        cardapio.metodos.carregarCarrinho()

        //atualiza o icone pequeno do botao carrinho , com a quantidade atualizada
        cardapio.metodos.atualizarBagdeTotal()
    }, 

    //atualiza o carrinho com a quantidade atual
    atualizarCarrinho: (id,qntd) =>{

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id))
        MEU_CARRINHO[objIndex].qntd = qntd

        //atualiza o icone pequeno do botao carrinho , com a quantidade atualizada
        cardapio.metodos.atualizarBagdeTotal()

        //ATUALIZA OS VALORES em reais totais do carrinho 
        cardapio.metodos.carregarValores()
    },

    //carrega os valores de subtotal, entrega e total
    carregarValores: () => {

        VALOR_CARRINHO = 0

        $("#lblSubTotal").text('R$ 0,00')
        $("#lblValorEntrega").text(' + R$ 0,00')
        $("#lblValorTotal").text('R$ 0,00')

        $.each(MEU_CARRINHO, (i,e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd)

            if((i+1) == MEU_CARRINHO.length){

                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`)
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`)
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`)
            }
        })

    },

    //carregar a etapa enderecos
    carregarEndereco: () =>{

        if(MEU_CARRINHO.length <= 0){
            cardapio.metodos.mensagem("Seu carrinho está vazio")
            return
        }

        cardapio.metodos.carregarEtapa(2)

    }, 

    //chama api viacep 
    buscarCEP: () => {
        //aqui o trin limpa o espaoço tanto no começo, tanto no final e usando um replace que deixa somente números, ou seja, tirando os pontos
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '')

        //validando oo cep, ou seja , se o cep for diferente de vazio, ou seja, se possui o valor informado
        if(cep != ""){

            //usando um regexp para validar o cep, assim somente 8digitos entre de 0 a 9, é um expressão regular para validar o nosso cep
            var validacep = /^[0-9]{8}$/
            //um teste do regexp, se cair dentro do if = true senão, o cep não existe, ou seja, não válido
            if(validacep.test(cep)){
                //chamar a API do viacep retornando um JSON e o callback me retorna que ele vai receber uma função pos receber os dados 
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function(dados){

                    //fazendo a validação do cep, se encentrar erro ou não
                    if(!("erro" in dados)){

                        // atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro)
                        $("#txtBairro").val(dados.bairro)
                        $("#txtCidade").val(dados.localidade)
                        $("#ddlUf").val(dados.uf)
                        $("#txtNumero").focus()


                    }
                    else{
                        cardapio.metodos.mensagem('CEP não encontrado')
                        $("#txtEndereco").focus()
                    }

                })

            }else{
                cardapio.metodos.mensagem("CEP ínvalido")
                //usando o focus, para focar o cursor que há um erro  no input do cep
                $("#txtCEP").focus()
            }

        }else{
            cardapio.metodos.mensagem("Informe o CEP, por favor")
            $("#txtCEP").focus()
        }
    },

    //validação antes de prosseguir para a etapa 3
    resumoPedido: () => {

        let cep =  $("#txtCEP").val().trim()
        let endereco =  $("#txtEndereco").val().trim()
        let bairro =  $("#txtBairro").val().trim()
        let cidade =  $("#txtCidade").val().trim()
        let uf =  $("#ddlUf").val().trim()
        let numero =  $("#txtNumero").val().trim()
        let complemento =  $("#txtComplemento").val().trim()

        if(cep.length <= 0){
            cardapio.metodos.mensagem("informe o CEP")
            $("#txtCEP").focus()
            return
        }
        if(endereco.length <= 0){
            cardapio.metodos.mensagem("informe o Endereço")
            $("#txtEndereco").focus()
            return
        }
        if(bairro.length <= 0){
            cardapio.metodos.mensagem("informe o bairro")
            $("#txtBairro").focus()
            return
        }
        if(cidade.length <= 0){
            cardapio.metodos.mensagem("informe a cidade")
            $("#txtCidade").focus()
            return
        }
        if(uf == -1){
            cardapio.metodos.mensagem("informe a UF")
            $("#ddlUf").focus()
            return
        }
        if(numero.length <= 0){
            cardapio.metodos.mensagem("informe o número")
            $("#txtNumero").focus()
            return
        }

        //se torna um objeto
        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro, 
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento, 
        }

        cardapio.metodos.carregarEtapa(3)
        cardapio.metodos.carregarResumo()

    },

    //carrega a etapa de resumo do pedido
    carregarResumo: () => {

        //limpar o html
        $("#listaItensResumo").html('')

        $.each(MEU_CARRINHO, (i,e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.',','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp)
        })

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro} `)
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`)


        cardapio.metodos.finalizarPedido()
        // https://wa.me/5561986183824?text=Ola

    },

    //método de finalizar pedido, atualiza o link do botao do wpp
    finalizarPedido: () => {

        if(MEU_CARRINHO.length > 0 && MEU_ENDERECO != null){

            var texto = 'ola, gostaria de fazer um pedido:'
            texto += '\n*Itens do pedido:*\n\n\${itens}'
            texto += '\n*Endereço de entrega:*'
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.',',')}*`

            var itens =''

            $.each(MEU_CARRINHO, (i,e) => {

                itens += `*${e.qntd}x* ${e.name} .......R$${e.price.toFixed(2).replace('.',',')} \n`;

                if((i+1) == MEU_CARRINHO.length){

                    texto = texto.replace(/\${itens}/g, itens)

                    //CONVERTE A URL
                    let encode = encodeURI(texto)

                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`

                    $("#btnEtapaResumo").attr('href', URL)
                }
            })
        }
    },

    //carrega o link do botão reserva
    carregarBotaoReserva: () => {

        var texto = 'Ola, gostaria de fazer uma *reserva*'

        let encode = encodeURI(texto)

        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`

        $('#btnReserva').attr('href', URL)

    },
    //carregar o botao d ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`)

    },

    //abre o depoimento
    abrirDepoimento: (depoimento) => {

        $("#depoimento-1").addClass('hidden')
        $("#depoimento-2").addClass('hidden')
        $("#depoimento-3").addClass('hidden')

        $("#btnDepoimento-1").removeClass('active')
        $("#btnDepoimento-2").removeClass('active')
        $("#btnDepoimento-3").removeClass('active')

        $("#depoimento-" + depoimento).removeClass('hidden')
        $("#btnDepoimento-" + depoimento).addClass('active')

    }, 

    // o tempo é em milisegundos, por isso 3500, mensgens de adicionar ao carrinho
    mensagem: (texto, cor = 'red', tempo= 3500) => {

        //essa função faz com que pegue um número aletorio e multiplico pela data atual em milisegundos, então sempre os ids são diferentes
        let id= Math.floor(Date.now() * Math.random()).toString()
        //template de mensgaem
        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`

        $("#container-mensagens").append(msg)

        //set time out espera um tempo para executar uma função dentro dele, com animação
        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown ')
            $("#msg-" + id).addClass('fadeOutUp')
            setTimeout(() => {
                $("#msg-" + id).remove()
            }, 800)
        }, tempo)
    },
}

cardapio.templates = {

    item: `                     
        <div class="col-12  col-lg-3 col-md-3 col-sm-6 mb-5">
            <div class="card card-item" id="\${id}">

                <div class="img-produto">
                    <img src="\${img}">
                </div>

                <p class="title-produto text-center mt-4">
                    <b>\${name}</b>
                </p>

                <p class="price-produto text-center">
                    <b>R$\${preco}</b>
                </p>

                <!--testenado botões de mais e menos para adicionar o produto no carrinho-->
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onClick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onClick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>`,
itemCarrinho:
                `<div class="col-12 item-carrinho">
                    <div class="img-produto">
                        <img src="\${img}" alt="hamburguer">
                    </div>
                    <div class="dados-produto">
                        <p class="title-produto"><b>\${name}</b></p>
                        <p class="price-produto"><b>\${preco}</b></p>
                    </div>
                    <div class="add-carrinho">
                        <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                        <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                        <span class="btn-mais" onClick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                        <span class="btn btn-remove no-mobile" onClick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fas fa-times"></i></span>
                    </div>
                </div>`,

itemResumo:
                `    
                <div class="col-12 item-carrinho resumo">
                    <div class="img-produto-resumo">
                        <img src="\${img}" alt="">
                    </div>

                    <div class="dados-produto">
                        <p class="title-produto-resumo">
                            <b>\${name}</b>
                        </p>
                    <p class="price-produto-resumo">
                        <b>\${preco}</b>
                    </p>
                    </div>
                        <p class="quantidade-produto-resumo">
                                    x <b>\${qntd}</b>
                        </p>
                </div>   `
}
